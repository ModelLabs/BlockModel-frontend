// module.exports = {
//   outputDir: 'dist',
//   //跨域代理
//   devServer: {
//     proxy: "http://10.100.117.41:8091/"
//   },
//   publicPath: process.env.NODE_ENV === 'production'
//     ? '/antV-X6-demo/'
//     : '/'
// }
module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    port: 8080,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '/api': {
        target: '/',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}