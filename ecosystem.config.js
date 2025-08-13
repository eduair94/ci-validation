module.exports = {
  apps: [
    {
      name: 'ci-validation',
      script: 'dist/index.js',
      autorestart: true
    }
  ]
};
