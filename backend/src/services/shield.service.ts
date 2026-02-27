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
 * Populates a shield transaction for BNB.
 * The user wraps BNB -> WBNB and deposits into the Railgun contract.
 * Returns a populated tx that the frontend sends to MetaMask for signing.
 *
 * @param railgunAddress - The 0zk address receiving shielded tokens
 * @param shieldPrivateKey - Signature from signing the shield message
 * @param amountWei - Amount in wei
 */
export async function populateShieldBNB(
  railgunAddress: string,
  shieldPrivateKey: string,
  amountWei: bigint,
): Promise<{ to: string; data: string; value?: bigint }> {
  const { wrappedAddress } = NETWORK_CONFIG[NETWORK].baseToken;

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
