/**
 * End-to-end test: Shield 0.01 BNB → wait for balance → Unshield 0.005 BNB
 *
 * Requires:
 *   - Backend running on http://localhost:3001
 *   - RELAYER_PRIVATE_KEY in .env (used as the source wallet for shielding)
 */
import { Wallet, JsonRpcProvider, parseEther, formatEther } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const API = 'http://localhost:3001/api';
const PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY!;
const RPC = process.env.BSC_TESTNET_RPC!;
const DESTINATION = '0xA21B55bD8eb8A2E28A3D71fe19020A392c64AD1E';
const SHIELD_AMOUNT = '0.01';
const UNSHIELD_AMOUNT = '0.005';
const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

const provider = new JsonRpcProvider(RPC);
const wallet = new Wallet(PRIVATE_KEY, provider);

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`API ${path} failed: ${(data as any).error}`);
  return data as T;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('=== GhostFund E2E Test ===');
  console.log(`Source wallet: ${wallet.address}`);
  console.log(`Destination:   ${DESTINATION}`);
  console.log(`Shield:        ${SHIELD_AMOUNT} BNB`);
  console.log(`Unshield:      ${UNSHIELD_AMOUNT} BNB`);
  console.log();

  const balance = await provider.getBalance(wallet.address);
  console.log(`Source balance: ${formatEther(balance)} BNB`);
  if (balance < parseEther(SHIELD_AMOUNT)) {
    throw new Error('Insufficient balance for shielding');
  }

  // Step 1: Create wallet
  console.log('\n--- Step 1: Create Railgun Wallet ---');
  const walletRes = await api<{ id: string; railgunAddress: string }>('/wallet/create', {
    method: 'POST',
    body: JSON.stringify({ mnemonic: TEST_MNEMONIC }),
  });
  console.log(`Wallet ID: ${walletRes.id}`);
  console.log(`0zk Address: ${walletRes.railgunAddress}`);

  // Step 2: Get shield signature message and sign it
  console.log('\n--- Step 2: Sign Shield Message ---');
  const { message } = await api<{ message: string }>('/shield/signature-message');
  console.log(`Message to sign: "${message}"`);
  const signature = await wallet.signMessage(message);
  console.log(`Signature: ${signature.slice(0, 20)}...`);

  // Step 3: Populate and submit shield tx
  console.log('\n--- Step 3: Shield BNB ---');
  const amountWei = parseEther(SHIELD_AMOUNT).toString();
  const shieldRes = await api<{ transaction: { to: string; data: string; value: string } }>('/shield', {
    method: 'POST',
    body: JSON.stringify({
      amount: amountWei,
      railgunAddress: walletRes.railgunAddress,
      shieldPrivateKey: signature,
    }),
  });
  console.log(`Shield tx populated → to: ${shieldRes.transaction.to}`);

  const tx = await wallet.sendTransaction({
    to: shieldRes.transaction.to,
    data: shieldRes.transaction.data,
    value: BigInt(shieldRes.transaction.value),
    gasLimit: 1_200_000n,
    gasPrice: 5_000_000_000n,
  });
  console.log(`Shield tx submitted: ${tx.hash}`);
  console.log(`BscScan: https://testnet.bscscan.com/tx/${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`Shield confirmed in block ${receipt?.blockNumber}`);

  // Step 4: Wait for scanner to detect the shielded balance
  console.log('\n--- Step 4: Waiting for Balance ---');
  console.log('Scanning Merkle tree (this may take 30-120 seconds)...');

  let balanceDetected = false;
  for (let attempt = 1; attempt <= 24; attempt++) {
    await sleep(10_000);
    try {
      const bal = await api<{ balanceWei: string; balanceFormatted: string }>(
        `/status/balance/${walletRes.id}`,
      );
      console.log(`  Attempt ${attempt}: balance = ${bal.balanceFormatted} BNB (${bal.balanceWei} wei)`);
      if (BigInt(bal.balanceWei) > 0n) {
        balanceDetected = true;
        console.log(`Balance detected: ${bal.balanceFormatted} BNB`);
        break;
      }
    } catch (err: any) {
      console.log(`  Attempt ${attempt}: ${err.message}`);
    }
  }

  if (!balanceDetected) {
    console.error('Balance not detected after 4 minutes. Scanner may still be syncing.');
    console.log('You can try the unshield step manually once balance appears.');
    console.log(`  Wallet ID: ${walletRes.id}`);
    return;
  }

  // Step 5: Unshield
  console.log('\n--- Step 5: Unshield BNB ---');
  const unshieldAmountWei = parseEther(UNSHIELD_AMOUNT).toString();
  console.log(`Requesting unshield of ${UNSHIELD_AMOUNT} BNB to ${DESTINATION}...`);
  console.log('(ZK proof generation takes 20-30 seconds)');

  const unshieldRes = await api<{ status: string; txHash: string; bscscanUrl: string }>('/unshield', {
    method: 'POST',
    body: JSON.stringify({
      walletId: walletRes.id,
      amount: unshieldAmountWei,
      destinationAddress: DESTINATION,
    }),
  });
  console.log(`Unshield status: ${unshieldRes.status}`);
  console.log(`Unshield tx: ${unshieldRes.txHash}`);
  console.log(`BscScan: ${unshieldRes.bscscanUrl}`);

  // Verify destination received BNB
  console.log('\n--- Verification ---');
  const destBalance = await provider.getBalance(DESTINATION);
  console.log(`Destination balance: ${formatEther(destBalance)} BNB`);

  console.log('\n=== E2E Test Complete ===');
}

main().catch((err) => {
  console.error('\nE2E test failed:', err.message);
  process.exit(1);
});
