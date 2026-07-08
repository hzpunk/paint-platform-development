// Programmatic registration of ts-node with forced CommonJS modules.
// This avoids shell quoting issues and ESM loader conflicts in Node 20.
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node'
  }
});

// Execute the original TypeScript seed file
require('./seed.ts');
