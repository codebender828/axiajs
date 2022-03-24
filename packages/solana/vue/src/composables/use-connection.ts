import { createContext } from '../utils/context';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { computed, ComputedRef } from 'vue';
import { ENDPOINTS, Endpoint } from '@axiajs/solana.core';

export enum SolanaNetworks {
  mainnet = 'mainnet-beta',
  devnet = 'devnet',
  testnet = 'testnet',
}

export type ConnectionContext = {
  connection: ComputedRef<Connection>;
  endpoint: ComputedRef<Endpoint>;
};

const [ConnectionContextProvider, useConnection, ConnectionInjectionKey] =
  createContext<ConnectionContext>({
    name: 'ConnectionContext',
    strict: true,
    errorMessage: 'useConnection requires you to provide the connection hook',
  });

export function initializeConnection(network: SolanaNetworks) {
  try {
    const _connection = new Connection(clusterApiUrl(network), 'recent');

    const connection = computed(() => _connection);
    const endpoint = computed(
      () => ENDPOINTS.find((e) => e.name === network) || ENDPOINTS[2] // Fallback to devnet
    );

    ConnectionContextProvider({
      connection,
      endpoint,
    });
    return {
      connection,
      endpoint,
    };
  } catch (error) {
    console.error('There was a problem initializing connection', error);
  }
}

export { ConnectionContextProvider, useConnection, ConnectionInjectionKey };
