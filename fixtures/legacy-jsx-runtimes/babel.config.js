module.exports = {
  presets: [
    [
      '@babel/devjs',
      {
        runtime: 'automatic',
        development: process.env.BABEL_ENV === 'development',
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
};
