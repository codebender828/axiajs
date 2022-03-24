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

export { SolanaNetworks };

const AxiaSolanaPlugin: Plugin = {
  install(app: App, options: AxiaSolanaPluginOptions) {
    // Create new connection instance
    const { connection, endpoint } = initializeConnection(options.network)!;
    app.provide(ConnectionInjectionKey, {
      connection,
      endpoint,
    });

    const ctx = initializeWallet();
    app.provide(WalletInjectionKey, ctx);
  },
};

export default AxiaSolanaPlugin;
