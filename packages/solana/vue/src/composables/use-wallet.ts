import { createContext } from '../utils/context';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { computed, ComputedRef, onMounted, reactive } from 'vue';
import { getWalletAdapters, PhantomWalletAdapter } from '@axiajs/solana.core';

export enum AxiaWalletAdapters {
  phantom = 'phantom',
  solflare = 'solflare',
  sollet = 'sollet',
}

export type WalletContext = {
  wallet: ComputedRef<PhantomWalletAdapter>;
};

const [WalletContextProvider, _useWallet, WalletInjectionKey] =
  createContext<WalletContext>({
    name: 'WalletContext',
    strict: true,
    errorMessage: 'useWallet requires you to provide the wallet context',
  });

export function initializeWallet() {
  try {
    const adapter = new PhantomWalletAdapter();
    const wallet = computed(() => adapter);
    const ctx = {
      wallet,
    };
    WalletContextProvider(ctx);
    return ctx;
  } catch (error) {
    console.error('There was a problem initializing wallet', error);
  }
}

function useWallet() {
  const { wallet, ...rest } = _useWallet();
  onMounted(async () => {
    if (!wallet.value.connect) {
      await wallet.value.connect();
    }
  });

  return {
    wallet,
    ...rest,
  };
}

export { WalletContextProvider, useWallet, WalletInjectionKey };
