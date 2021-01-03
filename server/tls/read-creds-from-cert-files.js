const { readFileSync } = require('fs');

function readCredsFromCertFiles({ caPath, keyPath, certPath }) {
  if (!caPath && (!keyPath || !certPath)) {
    throw Error('must provide TLS key and cert or only CA')
  }

  const pk = keyPath ? readFileSync(keyPath) : undefined;
  const cert = certPath ? readFileSync(certPath) : undefined;
  const ca = caPath ? readFileSync(caPath) : undefined;

  return { pk, cert, ca };
}

module.exports = { readCredsFromCertFiles };
