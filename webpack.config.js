// @ts-check
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

/** @param {Record<string, unknown>} _env @param {{ mode: string }} argv */
module.exports = (_env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/main.tsx',

    output: {
      path: path.resolve(__dirname, 'dist'),
      // Content-hash filenames in production for long-term caching.
      filename: isProd ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProd ? '[name].[contenthash].js' : '[name].js',
      // Allow the public path to be overridden via an environment variable.
      // Used in CI to set the correct base path for GitHub Pages deployments
      // (e.g. PUBLIC_PATH=/claude-code-todo-list/). Defaults to / for local dev.
      publicPath: process.env.PUBLIC_PATH || '/',
      clean: true,
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },

    module: {
      rules: [
        // TypeScript / JSX — transpiled by Babel; type-checking is handled
        // separately by ForkTsCheckerWebpackPlugin in parallel.
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
              ],
            },
          },
        },

        // CSS Modules — scoped styles used by all components.
        {
          test: /\.module\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                // Use CommonJS-style exports so the default import resolves
                // correctly regardless of how babel-loader handles ES modules.
                esModule: false,
                modules: {
                  // Readable class names in dev; hashed in production.
                  localIdentName: isProd ? '[hash:base64]' : '[local]__[hash:base64:5]',
                },
              },
            },
          ],
        },

        // Global CSS (e.g. src/styles/global.css).
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            { loader: 'css-loader', options: { esModule: false } },
          ],
        },
      ],
    },

    plugins: [
      // Injects the bundled scripts into index.html automatically.
      new HtmlWebpackPlugin({ template: './index.html' }),

      // Runs TypeScript type-checking in a separate worker so it does not
      // block the webpack compilation.
      new ForkTsCheckerWebpackPlugin(),

      // Extract CSS to separate files in production only.
      ...(isProd ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' })] : []),
    ],

    optimization: isProd
      ? {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  // Strip all console.* calls and debugger statements from
                  // the production bundle.
                  drop_console: true,
                  drop_debugger: true,
                },
              },
            }),
          ],
          splitChunks: {
            cacheGroups: {
              // Split React + ReactDOM into a separate vendor chunk so it
              // can be cached independently from app code.
              vendor: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'vendor',
                chunks: 'all',
              },
            },
          },
        }
      : {},

    devServer: {
      port: 8080,
      hot: true,
      // Required for client-side routing (SPA fallback).
      historyApiFallback: true,
      open: false,
    },

    // Inline source maps in dev for fast rebuilds; disabled in production.
    devtool: isProd ? false : 'eval-source-map',
  };
};
