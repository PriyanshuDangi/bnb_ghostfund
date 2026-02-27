import { ArtifactStore } from '@railgun-community/wallet';
import fs from 'fs';
import { ARTIFACTS_PATH } from './constants';

/**
 * Creates an ArtifactStore that persists ZK circuit artifacts to disk.
 * On first run, the Railgun Engine downloads ~50-100MB of Groth16 circuit
 * files from IPFS; subsequent runs use the cached files.
 */
export const createArtifactStore = (): ArtifactStore => {
  const basePath = ARTIFACTS_PATH;

  const getFile = async (path: string): Promise<Buffer> => {
    return fs.promises.readFile(`${basePath}/${path}`);
  };

  const storeFile = async (
    dir: string,
    path: string,
    item: string | Uint8Array,
  ): Promise<void> => {
    await fs.promises.mkdir(`${basePath}/${dir}`, { recursive: true });
    await fs.promises.writeFile(`${basePath}/${path}`, item);
  };

  const fileExists = (path: string): Promise<boolean> => {
    return fs.promises
      .access(`${basePath}/${path}`)
      .then(() => true)
      .catch(() => false);
  };

  return new ArtifactStore(getFile, storeFile, fileExists);
};
