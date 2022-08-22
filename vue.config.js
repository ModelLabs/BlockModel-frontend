module.exports = {
  outputDir: 'dist',
  //跨域代理
  devServer: {
    proxy: "http://10.100.117.41:8091/"
  },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/antV-X6-demo/'
    : '/'
}
