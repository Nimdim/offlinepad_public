module.exports = {
  devServer: {
    "proxy": {
      "^/api": {
        "target": "http://localhost:5000",
      },
      "^/ws/": {
        "target": "ws://localhost:8765",
        "secure": false,
        "ws": true,
      },
    }
  },
  chainWebpack: config => {
    if(config.plugins.has('extract-css')) {
      const extractCSSPlugin = config.plugin('extract-css')
      extractCSSPlugin && extractCSSPlugin.tap(() => [{
        filename: 'css/[name].css',
        chunkFilename: 'css/[name].css'
      }])
    }
  },
  configureWebpack: {
    output: {
      filename: 'js/[name].js',
      chunkFilename: 'js/[name].js'
    }
  }
}
