import { ParsedAccountBase } from '@axiajs/solana.utils';
import mitt from 'mitt';

type Events = {
  'token-added': ParsedAccountBase;
};

export const emitter = mitt<Events>();
