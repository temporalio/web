module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '~constants': './client/constants',
          '~components': './client/components',
          '~helpers': './client/helpers',
          '~features': './client/features',
        },
      },
    ],
    ['@babel/plugin-transform-regenerator'],
  ],
  presets: [
    [
      'env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-env',
  ],
};
