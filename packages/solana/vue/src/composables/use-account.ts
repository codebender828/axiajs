import { computed, ComputedRef, ref, Ref, watchEffect } from 'vue';
import {
  StringPublicKey,
  getParsedNftAccountsByOwner,
} from '@axiajs/solana.core';
import { useConnection } from './use-connection';
import { Metadata } from '../../../core/src/queries/config';

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

const tokenCache = ref(
  new Map<
    StringPublicKey,
    Awaited<ReturnType<typeof getParsedNftAccountsByOwner>>
  >()
);

export function useAccount(
  publicKey: Ref<StringPublicKey> | ComputedRef<StringPublicKey>
) {
  const connection = useConnection();
  const nfts = computed({
    get: () => tokenCache.value.get(publicKey.value),
    set(val) {
      tokenCache.value.set(publicKey.value, val!);
    },
  });

  async function syncNfts(pk: StringPublicKey) {
    return getParsedNftAccountsByOwner({
      publicAddress: publicKey.value,
      connection: connection.value,
    });
  }

  watchEffect(async () => {
    if (!tokenCache.value.get(publicKey.value)) {
      const userNfts = await syncNfts(publicKey.value);
      nfts.value = userNfts;
    }
  });

  return {
    nfts,
    syncNfts,
  };
}
