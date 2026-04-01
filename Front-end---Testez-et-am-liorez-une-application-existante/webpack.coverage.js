module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['istanbul'],
          },
        },
        enforce: 'post',
        include: /src/,
        exclude: [/\.spec\.ts$/, /node_modules/],
      },
    ],
  },
};
