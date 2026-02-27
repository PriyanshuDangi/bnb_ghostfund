import {
  startRailgunEngine,
  stopRailgunEngine,
  loadProvider,
  getProver,
  createRailgunWallet,
  rescanFullUTXOMerkletreesAndWallets,
  setOnUTXOMerkletreeScanCallback,
  setOnBalanceUpdateCallback,
  setLoggers,
} from '@railgun-community/wallet';
import {
  NETWORK_CONFIG,
  FallbackProviderJsonConfig,
  NetworkName,
  EVMGasType,
} from '@railgun-community/shared-models';
import path from 'path';
import { groth16 } from 'snarkjs';
import { createDatabase } from './database';
import { createArtifactStore } from './artifacts';
import {
  NETWORK,
  BSC_TESTNET_RPC,
  PPOI_AGGREGATOR_URL,
  RAILGUN_PROXY,
  RAILGUN_RELAY_ADAPT,
  RAILGUN_WBNB,
  DEPLOYMENT_BLOCK,
  RAILGUN_MNEMONIC,
  RAILGUN_ENCRYPTION_KEY,
} from './constants';

/**
 * Apply BSC testnet overrides to a NETWORK_CONFIG object's Hardhat entry.
 */
function applyPatch(networkConfig: any): void {
  const cfg = networkConfig[NetworkName.Hardhat];
  if (!cfg) return;
  cfg.chain.id = 97;
  cfg.baseToken.symbol = 'tBNB';
  cfg.baseToken.wrappedSymbol = 'WBNB';
  cfg.baseToken.wrappedAddress = RAILGUN_WBNB;
  cfg.proxyContract = RAILGUN_PROXY;
  cfg.relayAdaptContract = RAILGUN_RELAY_ADAPT;
  cfg.deploymentBlock = DEPLOYMENT_BLOCK;
  cfg.defaultEVMGasType = EVMGasType.Type0;
  // We only deployed V2 contracts — disable V3 to prevent calls to nonexistent addresses
  cfg.supportsV3 = false;
  cfg.poseidonMerkleAccumulatorV3Contract = undefined;
  cfg.poseidonMerkleVerifierV3Contract = undefined;
  cfg.tokenVaultV3Contract = undefined;
  cfg.deploymentBlockPoseidonMerkleAccumulatorV3 = undefined;
}

/**
 * Override the Hardhat network config to point at BSC testnet.
 * Must patch BOTH copies of shared-models: the top-level one our code
 * imports, and the nested one inside @railgun-community/wallet.
 */
function patchNetworkConfig(): void {
  if (NETWORK !== NetworkName.Hardhat) return;

  // Patch top-level shared-models (our import)
  applyPatch(NETWORK_CONFIG);

  // Patch the nested copy bundled inside the wallet SDK
  try {
    const walletEntryPoint = require.resolve('@railgun-community/wallet');
    const nestedPath = require.resolve('@railgun-community/shared-models', {
      paths: [path.dirname(walletEntryPoint)],
    });
    const nestedModule = require(nestedPath);
    if (nestedModule.NETWORK_CONFIG && nestedModule.NETWORK_CONFIG !== NETWORK_CONFIG) {
      applyPatch(nestedModule.NETWORK_CONFIG);
      console.log('[Engine] Patched nested shared-models inside wallet SDK');
    }
  } catch {
    console.warn('[Engine] Could not patch nested shared-models — may use single copy');
  }

  console.log('[Engine] Patched Hardhat config → BSC testnet (chain 97)');
}

/**
 * Full Railgun Engine initialization sequence:
 * 1. Patch network config for BSC testnet
 * 2. Start engine with LevelDB + artifact store + PPOI
 * 3. Configure Groth16 prover (snarkjs)
 * 4. Load BSC testnet provider
 */
export async function initializeRailgunEngine(): Promise<void> {
  patchNetworkConfig();

  console.log('[Engine] Creating database and artifact store...');
  const db = createDatabase();
  const artifactStore = createArtifactStore();

  // Redirect SDK internal debug/error logs to console so we can see scan errors
  setLoggers(
    (msg: string) => console.log('[SDK]', msg),
    (err: Error) => console.error('[SDK:ERR]', err.message, err.cause ? `| cause: ${(err.cause as Error).message}` : ''),
  );

  console.log('[Engine] Starting Railgun Engine...');
  await startRailgunEngine(
    'ghostfund',
    db,
    true,       // shouldDebug
    artifactStore,
    false,      // useNativeArtifacts
    false,      // skipMerkletreeScans
    [],         // poiNodeURLs — empty for our private testnet deployment
    [],         // customPOILists
    true,       // verboseScanLogging — enables detailed scan logs
  );

  // Track scanning progress
  setOnUTXOMerkletreeScanCallback((scanData: any) => {
    console.log('[Scanner]', JSON.stringify(scanData));
  });
  setOnBalanceUpdateCallback((balanceData: any) => {
    const { balanceBucket, erc20Amounts, railgunWalletID } = balanceData;
    const hasAmounts = erc20Amounts && erc20Amounts.length > 0;
    console.log(`[Balance Update] bucket=${balanceBucket} wallet=${railgunWalletID?.substring(0,12)} tokens=${erc20Amounts?.length ?? 0}${hasAmounts ? ' amounts=' + JSON.stringify(erc20Amounts) : ''}`);
  });

  console.log('[Engine] Configuring Groth16 prover...');
  getProver().setSnarkJSGroth16(groth16 as any);

  console.log('[Engine] Loading BSC testnet provider...');
  // SDK requires total provider weight >= 2 for fallback quorum.
  // maxLogsPerBatch controls how many blocks the scanner queries per RPC call.
  const providerConfig: FallbackProviderJsonConfig = {
    chainId: 97,
    providers: [
      {
        provider: BSC_TESTNET_RPC,
        priority: 1,
        weight: 2,
        maxLogsPerBatch: 10,
        stallTimeout: 10_000,
      },
    ],
  };

  const { feesSerialized } = await loadProvider(
    providerConfig,
    NETWORK,
    60_000,
  );

  console.log('[Engine] Railgun fees:', feesSerialized);

  // Pre-load the 0zk wallet so it survives server restarts.
  // createRailgunWallet is idempotent — same mnemonic always yields the same wallet ID.
  console.log('[Engine] Loading 0zk wallet from mnemonic...');
  const walletInfo = await createRailgunWallet(
    RAILGUN_ENCRYPTION_KEY,
    RAILGUN_MNEMONIC,
    {},
  );
  if (walletInfo) {
    console.log(`[Engine] 0zk wallet ready: ${walletInfo.id.substring(0, 16)}...`);

    // Kick off a full Merkle tree rescan in the background to pick up
    // any shield events that occurred while the server was down.
    const { chain } = NETWORK_CONFIG[NETWORK];
    rescanFullUTXOMerkletreesAndWallets(chain, [walletInfo.id]).catch(() => {});
    console.log('[Engine] Background Merkle tree rescan started.');
  }

  console.log('[Engine] Initialization complete.');

  process.on('SIGINT', async () => {
    console.log('[Engine] Shutting down...');
    await stopRailgunEngine();
    process.exit(0);
  });
}
