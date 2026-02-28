import { JsonRpcProvider, Wallet, FetchRequest } from 'ethers';
import { BSC_TESTNET_RPC, RELAYER_PRIVATE_KEY } from '../config/constants';

let provider: JsonRpcProvider;
let relayerWallet: Wallet;

/**
 * Returns a singleton JsonRpcProvider for BSC testnet.
 * Uses a 120s timeout — gas estimation for ZK unshield txs involves
 * heavy eth_call simulations that can exceed default timeouts on public RPCs.
 */
export function getProvider(): JsonRpcProvider {
  if (!provider) {
    const fetchReq = new FetchRequest(BSC_TESTNET_RPC);
    fetchReq.timeout = 120_000;
    provider = new JsonRpcProvider(fetchReq, undefined, {
      staticNetwork: true,
      batchMaxCount: 1,
    });
  }
  return provider;
}

/**
 * Returns the relayer wallet (ethers Wallet) connected to the BSC testnet provider.
 * The relayer signs and submits unshield transactions, paying BNB gas.
 */
export function getRelayerWallet(): Wallet {
  if (!relayerWallet) {
    relayerWallet = new Wallet(RELAYER_PRIVATE_KEY, getProvider());
  }
  return relayerWallet;
}

/**
 * Fetches the current gas price from the BSC testnet.
 * BSC uses Type0 transactions (legacy gas pricing).
 */
export async function getGasPrice(): Promise<bigint> {
  const p = getProvider();
  const feeData = await p.getFeeData();
  return feeData.gasPrice ?? 10_000_000_000n;
}

/**
 * Returns the relayer's current BNB balance (for monitoring gas funds).
 */
export async function getRelayerBalance(): Promise<string> {
  const wallet = getRelayerWallet();
  const balance = await wallet.provider!.getBalance(wallet.address);
  return balance.toString();
}
