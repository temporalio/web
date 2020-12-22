const { getTlsConfig } = require('../config');

function readCredsFromConfig() {
  const {
    key: keyBase64,
    cert: certBase64,
    ca: caBase64,
    serverName,
    verifyHost,
  } = getTlsConfig();

  if (!keyBase64) {
    throw Error('TLS key is not provided');
  }

  if (!certBase64) {
    throw Error('TLS certificate is not provided');
  }

  const pk = Buffer.from(keyBase64, 'base64');
  const cert = Buffer.from(certBase64, 'base64');
  const ca = caBase64 ? Buffer.from(caBase64, 'base64') : undefined;

  return { pk, cert, ca, serverName, verifyHost };
}

module.exports = { readCredsFromConfig };
