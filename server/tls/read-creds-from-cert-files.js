const grpc = require('grpc');
const { readFileSync } = require('fs');

function readCredsFromCertFiles({
  caPath,
  keyPath,
  certPath,
  serverName,
  verifyHost,
}) {
  if (!keyPath) {
    throw Error('TLS key is not provided');
  }

  if (!certPath) {
    throw Error('TLS certificate is not provided');
  }

  let credentials;

  const pk = readFileSync(keyPath);
  const cert = readFileSync(certPath);

  let ca;
  if (caPath) {
    ca = readFileSync(caPath);
  }

  let checkServerIdentity;
  if (verifyHost) {
    checkServerIdentity = (receivedName, cert) => {
      if (receivedName !== serverName) {
        throw new Error(
          `Server name verification error: ${serverName} but received hostname ${receivedName}`
        );
      }
    };
  }

  credentials = grpc.credentials.createSsl(caPath ? ca : undefined, pk, cert, {
    checkServerIdentity,
  });

  const options = {};
  if (serverName) {
    options['grpc.ssl_target_name_override'] = serverName;
  }

  return { credentials, options };
}

module.exports = { readCredsFromCertFiles };
