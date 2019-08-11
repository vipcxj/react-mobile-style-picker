module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: require.resolve('ts-loader'),
      },
      {
        loader: require.resolve('react-docgen-typescript-loader'),
      },
    ],
  });
  config.module.rules.push({
    test: /\.less$/,
    exclude: /node_modules/,
    use: ['style-loader', 'css-loader', 'less-loader'],
  });
  config.resolve.extensions.push('.ts', '.tsx', '.css', '.less');
  return config;
};
