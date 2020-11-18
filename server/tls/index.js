const grpc = require('grpc');
const { readFileSync } = require('fs');

const caPath = process.env.TEMPORAL_TLS_CA_PATH;
const keyPath = process.env.TEMPORAL_TLS_KEY_PATH;
const certPath = process.env.TEMPORAL_TLS_CERT_PATH;
const serverName = process.env.TEMPORAL_TLS_SERVER_NAME;
const verifyHost = [true, 'true', undefined].includes(
  process.env.TEMPORAL_TLS_ENABLE_HOST_VERIFICATION
);

function getCredentials() {
  if (keyPath === undefined) {
    console.log('establishing insecure connection...');
    return { credentials: grpc.credentials.createInsecure(), options: {} };
  }

  console.log('establishing secure connection using TLS...');

  let credentials;
  if (certPath === undefined) {
    throw Error('TLS certificate is not provided');
  }

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
    checkServerIdentity: verifyHost ? checkServerIdentity : undefined,
  });

  const options = {};
  if (serverName) {
    options['grpc.ssl_target_name_override'] = serverName;
  }

  return { credentials, options };
}

module.exports = { getCredentials };
