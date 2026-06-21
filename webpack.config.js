const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/main.tsx',
  output: { path: path.resolve(__dirname, 'dist'), filename: 'assets/app.[contenthash].js', publicPath: '' },
  resolve: { extensions: ['.tsx', '.ts', '.js'], mainFields: ['main', 'module'] },
  module: { rules: [
    { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
    { test: /\.css$/, use: ['style-loader', { loader: 'css-loader', options: { url: false } }] },
  ] },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
    new CopyPlugin({ patterns: [{ from: 'public', to: '.' }] }),
  ],
  devServer: { historyApiFallback: true, port: 5173 },
}
