const app = require('./server/index'),
  port = Number(process.env.TEMPORAL_WEB_PORT) || 8088,
  production = process.env.NODE_ENV === 'production',
  sslEnabled = process.env.TEMPORAL_WEB_USE_HTTPS || false;

if (sslEnabled === "true") {
  const https = require('https');
  const fs = require('fs');

  console.log('temporal-web ssl is enabled');
  https.createServer({
      key: fs.readFileSync(process.env.TEMPORAL_WEB_TLS_KEY_PATH),
      cert: fs.readFileSync(process.env.TEMPORAL_WEB_TLS_CERT_PATH),
    }, 
    app.init().callback()
  ).listen(port);
} else {
  console.log('temporal-web ssl is not enabled');
  app.init().listen(port);
}

console.log('temporal-web up and listening on port ' + port);

if (!production) {
  console.log('webpack is compiling...');
}