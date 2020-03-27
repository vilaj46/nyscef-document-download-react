const path = require('path');

module.exports = {
  // change to production once we are done
  // none is used for testing so we can actually debug
  mode: 'none',
  context: path.resolve(__dirname, 'src/scripts'),
  entry: {
    // Background scripts.
    'background/background.js': './background/background.js',
    'background/backgroundData.js': './background/backgroundData.js',
    'background/backgroundUtils.js': './background/backgroundUtils.js',
    // Content scripts.
    'content/Button.js': './content/Button.js',
    'content/contentActions.js': './content/contentActions.js',
    'content/contentUtils.js': './content/contentUtils.js',
    'content/storage.js': './content/storage.js',
    'content/content.js': './content/content.js',
  },
  output: {
    path: path.resolve(__dirname, 'build/scripts'),
    filename: '[name]',
  },
};
