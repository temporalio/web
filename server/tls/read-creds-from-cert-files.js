const { readFileSync } = require('fs');

function readCredsFromCertFiles({ caPath, keyPath, certPath }) {
  if (!keyPath) {
    throw Error('TLS key is not provided');
  }

  if (!certPath) {
    throw Error('TLS certificate is not provided');
  }

  const pk = readFileSync(keyPath);
  const cert = readFileSync(certPath);

  let ca;
  if (caPath) {
    ca = readFileSync(caPath);
  }

  return { pk, cert, ca };
}

module.exports = { readCredsFromCertFiles };
