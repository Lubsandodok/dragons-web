const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "http://localhost:9001/",
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
