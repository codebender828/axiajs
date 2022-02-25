import { Connection, PublicKey } from '@solana/web3.js';
import { METADATA_PROGRAM_ID, StringPublicKey } from '@axiajs/solana.utils';
import { decodeTokenMetadata } from '../utils';

export const getParsedNftAccountsByUpdateAuthority = async ({
  updateAuthority,
  connection,
}: {
  updateAuthority: StringPublicKey;
  connection: Connection;
}) => {
  try {
    const res = await connection.getProgramAccounts(
      new PublicKey(METADATA_PROGRAM_ID),
      {
        encoding: 'base64',
        filters: [
          {
            memcmp: {
              offset: 1,
              bytes: updateAuthority,
            },
          },
        ],
      }
    );

    const decodedArray = await Promise.all(
      res.map((acc) => decodeTokenMetadata(acc.account.data))
    );

    return decodedArray;
  } catch (err) {
    console.error(err);
    return [];
  }
};
