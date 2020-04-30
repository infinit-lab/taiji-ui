module.exports = {
  devServer: {
    open: false,
    host: "0.0.0.0",
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8088",
        changeOrigin: true,
        ws: true
      },
      "/ws": {
        target: "http://127.0.0.1:8088",
        changeOrigin: true,
        ws: true
      }
    }
  }
};
