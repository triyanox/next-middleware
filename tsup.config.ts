import { defineConfig } from 'tsup';

export default defineConfig({
  target: 'edge',
  format: ['cjs', 'esm'],
  dts: true,
});
