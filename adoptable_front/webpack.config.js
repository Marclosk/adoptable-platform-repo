const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'production', // optimizaciones de minificación, tree-shaking…
  entry: './src/index.tsx', // punto de entrada de tu app React/TSX
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: 'babel-loader', // o 'ts-loader' si prefieres
      },
      // aquí podrías añadir loaders para CSS, imágenes, etc.
    ],
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static', // genera un HTML estático
      reportFilename: 'report.html',
      openAnalyzer: false, // false para no abrirlo automáticamente
    }),
  ],
};
