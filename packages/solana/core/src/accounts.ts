import { Connection, PublicKey } from '@solana/web3.js';
import {
  StringPublicKey,
  toPublicKey,
  decodeMetadata,
  deserializeAccount,
  cache,
  TokenAccount,
  programIds,
  TokenAccountParser,
  MintParser,
} from '@axiajs/solana.utils';
import { AccountLayout } from '@solana/spl-token';

const PRECACHED_OWNERS = new Set<string>();

const precacheUserTokenAccounts = async (
  connection: Connection,
  owner?: PublicKey
) => {
  if (!owner) {
    return;
  }

  // used for filtering account updates over websocket
  PRECACHED_OWNERS.add(owner.toBase58());

  console.log({ PRECACHED_OWNERS });

  // user accounts are updated via ws subscription
  const accounts = await connection.getTokenAccountsByOwner(owner, {
    programId: programIds().token,
  });

  accounts.value.forEach((info) => {
    cache.add(info.pubkey.toBase58(), info.account, TokenAccountParser);
  });
};

export async function getUserAccounts<S extends StringPublicKey | string>(
  publicKey: PublicKey | S
) {
  let pk: PublicKey;
  if (typeof publicKey === 'string') pk = toPublicKey(publicKey);
  else pk = publicKey;

  const userAccounts = cache
    .byParser(TokenAccountParser)
    .map((id) => cache.get(id))
    .filter((a) => a && a.info.owner.toBase58() === pk.toBase58())
    .map((a) => a as TokenAccount);

  return userAccounts;
}

export async function subscribeToUserTokenAccounts<
  S extends StringPublicKey | string
>(publicKey: PublicKey | S, connection: Connection) {
  let pk: PublicKey;
  if (typeof publicKey === 'string') pk = toPublicKey(publicKey);
  else pk = publicKey;

  precacheUserTokenAccounts(connection, pk).then(async () => {
    [];
  });

  const tokenSubscriptionID = connection.onProgramAccountChange(
    programIds().token,
    (info) => {
      const id = info.accountId as unknown as string;
      // TODO: do we need a better way to identify layout (maybe a enum identifing type?)
      if (info.accountInfo.data.length === AccountLayout.span) {
        const data = deserializeAccount(info.accountInfo.data);

        if (PRECACHED_OWNERS.has(data.owner.toBase58())) {
          const parsed = cache.add(id, info.accountInfo, TokenAccountParser);
          console.log('TokenAccount', parsed);
        }
      }
    },
    'singleGossip'
  );

  function unsubscribe() {
    connection.removeProgramAccountChangeListener(tokenSubscriptionID);
  }

  return unsubscribe;
}
