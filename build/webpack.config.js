const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const WorkboxPlugin = require('workbox-webpack-plugin');

const path = require('path');

function resolvePath(dir) {
  return path.join(__dirname, '..', dir);
}

const env = process.env.NODE_ENV || 'development';
const target = process.env.TARGET || 'web';

const isLocal = process.env.TERM_PROGRAM == 'vscode' && process.env.OS.includes("Windows");
console.log("Build for local webpack-dev-server: ", isLocal);

module.exports = {
  mode: env,
  entry: {
    app: './src/js/app.js',
  },
  output: {
    path: resolvePath('www'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
    publicPath: '',
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      '@': resolvePath('src'),
    },

  },
  devtool: env === 'production' ? 'source-map' : 'eval',
  devServer: {
    hot: true,
    open: true,
    compress: true,
    contentBase: '/www/',
    disableHostCheck: true,
    historyApiFallback: true,
    https: true,
    watchOptions: {
      poll: 1000,
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  optimization: {
    minimizer: [new TerserPlugin({
      sourceMap: true,
    })],
  },
  module: {
    rules: [
      {
        test: /\.(mjs|js|jsx)$/,
        use: 'babel-loader',
        include: [
          resolvePath('src'),
          resolvePath('node_modules/framework7'),

          resolvePath('node_modules/framework7-react'),

          resolvePath('node_modules/template7'),
          resolvePath('node_modules/dom7'),
          resolvePath('node_modules/ssr-window'),
        ],
      },

      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        include: [
          resolvePath('src'),
          resolvePath('src/pages')
        ],
      },


      {
        test: /\.css$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.styl(us)?$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
          'stylus-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
          'less-loader',
        ],
      },
      {
        test: /\.(sa|sc)ss$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'images/[name].[ext]',

        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac|m4a)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[ext]',

        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[ext]',

        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.TARGET': JSON.stringify(target),
    }),

    ...(env === 'production' ? [
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true,
          map: { inline: false },
        },
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
    ] : [
      // Development only plugins
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
    ]),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './src/index.html',
      inject: true,
      minify: env === 'production' ? {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      } : false,
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          noErrorOnMissing: true,
          from: resolvePath('src/static'),
          to: resolvePath('www/static'),
        },
        /*{
          noErrorOnMissing: true,
          from: resolvePath('src/manifest.json'),
          to: resolvePath('www/manifest.json'),
        },*/
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.sveAPI': (isLocal) ? "'media.felixlehner.de'" : "undefined",
      'process.env.authAPI': (isLocal) ? "'accounts.felixlehner.de/auth'" : "undefined",
      'process.env.accountsAPI': (isLocal) ? "'accounts.felixlehner.de'" : "undefined",
      'process.env.gameAPI': (isLocal) ? "'games.felixlehner.de'" : "undefined",
      'process.env.aiAPI': (isLocal) ? "'ai.felixlehner.de'" : "undefined",
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      swDest: "service-worker.js",
      inlineWorkboxRuntime: true,
      navigationPreload: true,
      maximumFileSizeToCacheInBytes: 250000000,
      mode: 'production',
      runtimeCaching: [{
        urlPattern: /.(?:png|jpg|jpeg|svg|gif)$/,
        
        // Apply a cache-first strategy.
        handler: 'CacheFirst',
        
        options: {
          // Use a custom cache name.
          cacheName: 'images',
      
          // Only cache 100 images.
          expiration: {
            maxEntries: 100,
          },
        },
      },
      {
        urlPattern: /.(?:html|js|css|ts|tsx|jsx|json|map|ttf|eot|woff|woff2)$/,
        
        // Apply a cache-first strategy.
        handler: 'NetworkFirst',
      
        options: {
          networkTimeoutSeconds: 3,
          // Use a custom cache name.
          cacheName: 'pwa',
        },
      }],
    }),
    new WebpackPwaManifest({
      name: 'sve-online',
      short_name: 'sveo',
      description: 'Webapp für das SVE MediaSystem',
      theme_color: '#008c0e',
      background_color: '#008c0e',
      lang: "de-DE",
      crossorigin: 'use-credentials',
      filename: "manifest.json",
      orientation: "portrait",
      display: "standalone",
      start_url: "/",
      swSrc: resolvePath('service-worker.js'), 
      fingerprints: true,
      inject: true,
      ios: {
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "black-translucent",
        "apple-mobile-web-app-title": "sve-online",
      },
      includeDirectory: true,
      icons: [
        {
          src: path.resolve('assets-src/apple-touch-icon.png'),
          sizes: [120, 152, 167, 180, 1024],
          destination: path.join('icons', 'ios'),
          ios: true
        },
        {
          src: path.resolve('assets-src/apple-touch-icon.png'),
          size: 1024,
          destination: path.join('icons', 'ios'),
          ios: 'startup'
        },
        {
          src: path.resolve('assets-src/apple-touch-icon.png'),
          sizes: [36, 48, 72, 96, 144, 192, 512],
          destination: path.join('icons', 'android')
        }
      ]
    }),
    /*new WorkboxPlugin.InjectManifest({
      swSrc: resolvePath('service-worker.js'),
      maximumFileSizeToCacheInBytes: 25000000,
    }),*/
    new webpack.ContextReplacementPlugin(
      /\/package-name\//,
      (data) => {
        delete data.dependencies[0].critical;
        return data;
      },
    ),
  ],
};