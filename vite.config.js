import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // Load all env vars regardless of prefix
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // React plugin with regex include to handle both .js and .jsx files
    plugins: [
      react({
        include: /\.(js|jsx|ts|tsx)$/,
      }),
    ],

    // Global esbuild config: enable JSX automatic runtime so vite:build-html plugin
    // can handle JSX without erroring before the React plugin transform runs.
    // Also treats .js files as JSX for the Rollup esbuild transform.
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
      loader: 'jsx',
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
    },

    optimizeDeps: {
      esbuildOptions: {
        // Treat .js files as JSX during dependency pre-bundling
        loader: { '.js': 'jsx' },
      },
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // Forward REACT_APP_ env vars so existing source files work without changes
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL || ''),
      'process.env.REACT_APP_API_URL_PROD': JSON.stringify(env.REACT_APP_API_URL_PROD || ''),
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },

    server: {
      port: 3003,
      open: false,
      proxy: {
        '/api': {
          target: env.REACT_APP_API_URL || 'https://127.0.0.1:4000',
          changeOrigin: true,
          secure: false, // accept self-signed / mkcert certs
        },
      },
    },

    build: {
      outDir: 'build',
      sourcemap: env.GENERATE_SOURCEMAP === 'true',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'radix-vendor': [
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-popover',
            ],
          },
        },
      },
    },
  }
})
