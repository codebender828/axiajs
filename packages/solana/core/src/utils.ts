import { PublicKey } from '@solana/web3.js';
import { METADATA_PREFIX, METADATA_PROGRAM_ID } from '@axiajs/solana.utils';
import { Metadata, METADATA_SCHEMA } from './queries/config';
import { deserializeUnchecked } from 'borsh';

export type StringPublicKey = string;

const PubKeysInternedMap = new Map<string, PublicKey>();

export const toPublicKey = (key: string | PublicKey) => {
  if (typeof key !== 'string') {
    return key;
  }

  let result = PubKeysInternedMap.get(key);
  if (!result) {
    result = new PublicKey(key);
    PubKeysInternedMap.set(key, result);
  }

  return result;
};

export const pubkeyToString = (key: PublicKey | null | string = '') => {
  return typeof key === 'string' ? key : key?.toBase58() || '';
};

const metaProgamPublicKey = new PublicKey(METADATA_PROGRAM_ID);
const metaProgamPublicKeyBuffer = metaProgamPublicKey.toBuffer();
// Create UTF-8 bytes Buffer from string
// similar to Buffer.from(METADATA_PREFIX) but should work by default in node.js/browser
const metaProgamPrefixBuffer = new TextEncoder().encode(METADATA_PREFIX);

/**
 * Get Addresses of Metadata account assosiated with Mint Token
 */
export async function getSolanaMetadataAddress(tokenMint: PublicKey) {
  const metaProgamPublicKey = new PublicKey(METADATA_PROGRAM_ID);
  return (
    await PublicKey.findProgramAddress(
      [metaProgamPrefixBuffer, metaProgamPublicKeyBuffer, tokenMint.toBuffer()],
      metaProgamPublicKey
    )
  )[0];
}

/**
 * Check if passed address is Solana address
 */
export const isValidSolanaAddress = (address: string) => {
  try {
    // this fn accepts Base58 character
    // and if it pass we suppose Solana address is valid
    new PublicKey(address);
    return true;
  } catch (error) {
    // Non-base58 character or can't be used as Solana address
    return false;
  }
};

export const decodeTokenMetadata = async (buffer: Buffer) =>
  deserializeUnchecked(METADATA_SCHEMA, Metadata, buffer);

/** Standard Metadata standard to be returned by an NFT's token URI */
export interface IMetadata {
  description: string;
  external_url: string;
  image: string;
  name: string;
  attributes?: AttributesEntity[] | null;
}
export interface AttributesEntity {
  trait_type: string;
  value: string | number;
  display_type?: string | null;
}
