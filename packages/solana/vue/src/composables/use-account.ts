import { computed, ComputedRef, ref, Ref, watchEffect } from 'vue';
import {
  StringPublicKey,
  getParsedNftAccountsByOwner,
  IMetadata,
} from '@axiajs/solana.core';
import { useConnection } from './use-connection';

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

const tokenCache = ref(
  new Map<
    StringPublicKey,
    Awaited<
      ReturnType<typeof getParsedNftAccountsByOwner> & { metadata: IMetadata }
    >
  >()
);

export function useAccount(
  publicKey: Ref<StringPublicKey> | ComputedRef<StringPublicKey>
) {
  const connection = useConnection();
  const nfts = computed({
    get: () => tokenCache.value.get(publicKey.value)!,
    set(val) {
      tokenCache.value.set(publicKey.value, val!);
    },
  });

  async function syncNfts(pk: StringPublicKey) {
    const nfts = await getParsedNftAccountsByOwner({
      publicAddress: pk,
      connection: connection.value,
    });

    const nftsWithMetadataPromises = nfts?.map?.(async (n: any) => {
      const nft = {
        ...n,
        metadata: await fetchMetadata(n.data.uri).catch((e) =>
          console.error(e)
        ),
      };
      return nft;
    });
    const nftsWithMetadata = await Promise.all(nftsWithMetadataPromises!);
    return nftsWithMetadata;
  }

  watchEffect(async () => {
    if (!tokenCache.value.get(publicKey.value)) {
      nfts.value = await syncNfts(publicKey.value);
    }
  });

  // TODO: Subscribe to token account changes on client

  return {
    nfts,
    syncNfts,
  };
}

async function fetchMetadata(uri: string) {
  // const { data: metadata } = await axios(uri)
  const metadata = await fetch(uri, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
  return metadata;
}
