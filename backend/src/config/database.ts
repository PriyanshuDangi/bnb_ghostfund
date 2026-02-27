import LevelDOWN from 'leveldown';
import { ENGINE_DB_PATH } from './constants';

/**
 * Creates the LevelDOWN database instance used internally by Railgun Engine
 * to persist Merkle tree state and encrypted UTXO data.
 * We never read/write to this directly — it's managed by the SDK.
 */
export const createDatabase = () => {
  return LevelDOWN(ENGINE_DB_PATH);
};
