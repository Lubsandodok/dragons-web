const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "http://127.0.0.1:9001/",
      headers: {
        "Connection": "keep-alive",
      },
      pathRewrite: {
        "^/api": "",
      },
      onError: (err, req, res) => {
        console.log('Error', err);
        res.end("Something went wrong. And we are reporting a custom error message.");
      }
    })
  );
};
