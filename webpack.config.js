const fs = require('fs');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

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
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.(jp(e*)g|png|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name].[ext]',
            outputPath: '../img/',
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
    new CopyWebpackPlugin([{ from: 'src/img/', to: 'img' }]),
    new FaviconsWebpackPlugin({
      logo: './src/img/favicon.png',
      prefix: './img/favicons/',
      inject: true,
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: false,
        favicons: true,
        firefox: true,
        windows: true
      }
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
          template: `./src/${filename}.html`
        });
      })
  )
};
