const fs = require('fs');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

console.log('NODE_ENV: ', process.env.NODE_ENV && process.env.NODE_ENV.trim() == 'production' ? 'production' : 'development');

module.exports = {
  entry: ['./src/js/app.js'],
  devServer: {
    watchContentBase: true,
    contentBase: path.resolve(__dirname, 'src')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/app.js'
  },
  optimization: {
    minimizer: [new TerserPlugin({ cache: true, parallel: true, sourceMap: true }), new OptimizeCSSAssetsPlugin({})]
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /(node_modules)/
      },
      {
        test: /\.(css|scss|sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: {
          loader: 'url-loader',
          options: {
            name: '[path][name].[ext]',
            context: 'src',
            outputPath: './',
            limit: 10000, // Convert images < 10kb to base64 strings
            emitFile: false // Don't emit file since this is taken care of by CopyWebpackPlugin
          }
        }
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: 'css/app.css' }),
    new FaviconsWebpackPlugin({
      logo: './src/img/favicon.png',
      prefix: './img/favicons/',
      inject: true,
      emitStats: false,
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: false,
        favicons: true,
        firefox: true,
        windows: true
      }
    }),
    new CopyWebpackPlugin([{ from: 'src/img/', to: 'img' }]),
    new ImageminPlugin({
      disable: process.env.NODE_ENV !== 'production', // Disable during development
      test: /\.(jpe?g|png|gif|svg)$/i,
      minFileSize: 10000 // Only apply this one to files over 10kb
    })
  ].concat(
    // This function generates HTML files for each .html in /src directory
    fs
      .readdirSync('./src')
      .filter(fn => fn.endsWith('.html'))
      .map(html_file => {
        // Split names and extensions
        const parts = html_file.split('.');
        const filename = parts[0];
        // Create new HtmlWebpackPlugin with options
        return new HtmlWebpackPlugin({
          filename: `${filename}.html`,
          template: `./src/${filename}.html`,
          hash: true
        });
      })
  )
};
