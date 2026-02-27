import {
  startRailgunEngine,
  stopRailgunEngine,
  loadProvider,
  getProver,
} from '@railgun-community/wallet';
import {
  NETWORK_CONFIG,
  FallbackProviderJsonConfig,
  NetworkName,
  EVMGasType,
} from '@railgun-community/shared-models';
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
} from './constants';

/**
 * Override the Hardhat network config to point at BSC testnet.
 * This is the "Option B" fallback approach — avoids forking shared-models.
 */
function patchNetworkConfig(): void {
  if (NETWORK === NetworkName.Hardhat) {
    const config = NETWORK_CONFIG[NetworkName.Hardhat];
    config.chain.id = 97;
    config.baseToken.symbol = 'tBNB';
    config.baseToken.wrappedSymbol = 'WBNB';
    config.baseToken.wrappedAddress = RAILGUN_WBNB;
    config.proxyContract = RAILGUN_PROXY;
    config.relayAdaptContract = RAILGUN_RELAY_ADAPT;
    config.deploymentBlock = DEPLOYMENT_BLOCK;
    config.defaultEVMGasType = EVMGasType.Type0;
    console.log('[Engine] Patched Hardhat config → BSC testnet (chain 97)');
  }
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

  console.log('[Engine] Starting Railgun Engine...');
  await startRailgunEngine(
    'ghostfund',
    db,
    true,
    artifactStore,
    false,
    false,
    [PPOI_AGGREGATOR_URL],
    [],
    false,
  );

  console.log('[Engine] Configuring Groth16 prover...');
  getProver().setSnarkJSGroth16(groth16 as any);

  console.log('[Engine] Loading BSC testnet provider...');
  const providerConfig: FallbackProviderJsonConfig = {
    chainId: 97,
    providers: [
      {
        provider: BSC_TESTNET_RPC,
        priority: 1,
        weight: 1,
        maxLogsPerBatch: 1,
      },
    ],
  };

  const { feesSerialized } = await loadProvider(
    providerConfig,
    NETWORK,
    60_000,
  );

  console.log('[Engine] Railgun fees:', feesSerialized);
  console.log('[Engine] Initialization complete.');

  process.on('SIGINT', async () => {
    console.log('[Engine] Shutting down...');
    await stopRailgunEngine();
    process.exit(0);
  });
}
