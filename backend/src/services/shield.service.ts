import {
  populateShieldBaseToken,
  getShieldPrivateKeySignatureMessage,
} from '@railgun-community/wallet';
import {
  NETWORK_CONFIG,
  TXIDVersion,
  EVMGasType,
  type RailgunERC20AmountRecipient,
} from '@railgun-community/shared-models';
import { keccak256 } from 'ethers';
import { NETWORK } from '../config/constants';

/**
 * Returns the message that the user must sign to derive the shield private key.
 * The frontend asks MetaMask to sign this message, then passes the signature
 * as `shieldPrivateKey` to the shield endpoint.
 */
export function getShieldSignatureMessage(): string {
  return getShieldPrivateKeySignatureMessage();
}

/**
 * Derives a 32-byte shield private key from a MetaMask signature.
 * The SDK expects exactly 32 bytes for the Ed25519 scalar derivation,
 * but MetaMask signatures are 65 bytes (r + s + v). Hashing with
 * keccak256 produces the required 32-byte key deterministically.
 */
function deriveShieldKey(signature: string): string {
  return keccak256(signature);
}

/**
 * Populates a shield transaction for BNB.
 * The user wraps BNB -> WBNB and deposits into the Railgun contract.
 * Returns a populated tx that the frontend sends to MetaMask for signing.
 *
 * @param railgunAddress - The 0zk address receiving shielded tokens
 * @param signedMessage - Raw 65-byte MetaMask signature (hashed to 32 bytes internally)
 * @param amountWei - Amount in wei
 */
export async function populateShieldBNB(
  railgunAddress: string,
  signedMessage: string,
  amountWei: bigint,
): Promise<{ to: string; data: string; value?: bigint }> {
  const { wrappedAddress } = NETWORK_CONFIG[NETWORK].baseToken;
  const shieldPrivateKey = deriveShieldKey(signedMessage);

  const wrappedERC20Amount: RailgunERC20AmountRecipient = {
    tokenAddress: wrappedAddress,
    amount: amountWei,
    recipientAddress: railgunAddress,
  };

  const gasDetails = {
    evmGasType: EVMGasType.Type0 as const,
    gasEstimate: 0n,
    gasPrice: 10_000_000_000n,
  };

  const { transaction } = await populateShieldBaseToken(
    TXIDVersion.V2_PoseidonMerkle,
    NETWORK,
    railgunAddress,
    shieldPrivateKey,
    wrappedERC20Amount,
    gasDetails,
  );

  return transaction;
}
