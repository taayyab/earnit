// craco.config.js
const path = require("path");
require("dotenv").config();

// Environment variable overrides
const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === "true",
  enableVisualEdits: process.env.REACT_APP_ENABLE_VISUAL_EDITS === "true",
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
};

// Conditionally load visual editing modules only if enabled
let babelMetadataPlugin;
let setupDevServer;

if (config.enableVisualEdits) {
  babelMetadataPlugin = require("./plugins/visual-edits/babel-metadata-plugin");
  setupDevServer = require("./plugins/visual-edits/dev-server-setup");
}

// Conditionally load health check modules only if enabled
let WebpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  WebpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
  setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
  healthPluginInstance = new WebpackHealthPlugin();
}

const webpackConfig = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig, { env }) => {
      const isProduction = env === 'production';

      // Disable hot reload completely if environment variable is set
      if (config.disableHotReload) {
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          return !(plugin.constructor.name === 'HotModuleReplacementPlugin');
        });

        webpackConfig.watch = false;
        webpackConfig.watchOptions = {
          ignored: /.*/,
        };
      } else {
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
          ],
        };
      }

      // Add health check plugin to webpack if enabled
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins.push(healthPluginInstance);
      }

      // Vendor chunk splitting for better caching and code splitting
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            default: false,
            vendors: false,
            react: {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              chunks: 'all',
              priority: 40,
              enforce: true,
            },
            lodash: {
              name: 'lodash-vendor',
              test: /[\\/]node_modules[\\/]lodash[\\/]/,
              chunks: 'all',
              priority: 30,
              enforce: true,
            },
            radix: {
              name: 'radix-vendor',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              chunks: 'all',
              priority: 25,
              enforce: true,
            },
            commons: {
              name: 'commons',
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
        runtimeChunk: 'single',
      };

      // Disable source maps in production for faster builds
      // Set GENERATE_SOURCEMAP=true if debugging is needed
      if (isProduction) {
        webpackConfig.devtool = process.env.GENERATE_SOURCEMAP === 'true' ? 'source-map' : false;
      }

      return webpackConfig;
    },
  },
};

// Only add babel plugin if visual editing is enabled
if (config.enableVisualEdits) {
  webpackConfig.babel = {
    plugins: [babelMetadataPlugin],
  };
}

// Setup dev server with visual edits and/or health check
webpackConfig.devServer = (devServerConfig) => {
  // Configure for Replit environment
  devServerConfig.port = process.env.PORT || 3002;
  devServerConfig.host = '0.0.0.0';
  devServerConfig.allowedHosts = 'all';
  
  // Proxy API requests to backend server
  devServerConfig.proxy = {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
  };
  
  // Apply visual edits dev server setup if enabled
  if (config.enableVisualEdits && setupDevServer) {
    devServerConfig = setupDevServer(devServerConfig);
  }

  // Add health check endpoints if enabled
  if (config.enableHealthCheck && setupHealthEndpoints && healthPluginInstance) {
    const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      // Call original setup if exists
      if (originalSetupMiddlewares) {
        middlewares = originalSetupMiddlewares(middlewares, devServer);
      }

      // Setup health endpoints
      setupHealthEndpoints(devServer, healthPluginInstance);

      return middlewares;
    };
  }

  return devServerConfig;
};

module.exports = webpackConfig;
