import { App, Plugin } from 'vue';
import {
  ConnectionInjectionKey,
  initializeConnection,
  SolanaNetworks,
  initializeWallet,
  WalletInjectionKey,
} from './composables';

export interface AxiaSolanaPluginOptions {
  network: SolanaNetworks;
}

const AxiaSolanaPlugin: Plugin = {
  install(app: App, options: AxiaSolanaPluginOptions) {
    // Create new connection instance
    const connection = initializeConnection(options.network);
    app.provide(ConnectionInjectionKey, connection);

    const ctx = initializeWallet();
    app.provide(WalletInjectionKey, ctx);
  },
};

export default AxiaSolanaPlugin;
