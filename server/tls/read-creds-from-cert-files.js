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

function readCAFromFile(caPath) {
  if (!caPath) {
    throw Error('TLS CA is not provided')
  }

  return readFileSync(caPath);
}

module.exports = { readCredsFromCertFiles, readCAFromFile };
