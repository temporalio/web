const grpc = require('grpc');
const { readCredsFromCertFiles } = require('./read-creds-from-cert-files');
const { readCredsFromYml } = require('./read-creds-from-yml-file');
const { compareCaseInsensitive } = require('../utils');

const keyPath = process.env.TEMPORAL_TLS_KEY_PATH;
const certPath = process.env.TEMPORAL_TLS_CERT_PATH;
const caPath = process.env.TEMPORAL_TLS_CA_PATH;
const serverName = process.env.TEMPORAL_TLS_SERVER_NAME;
const verifyHost = [true, 'true', undefined].includes(
  process.env.TEMPORAL_TLS_ENABLE_HOST_VERIFICATION
);
const configPath = process.env.TEMPORAL_TLS_YML_PATH;

function getCredentials() {
  if (keyPath !== undefined) {
    console.log('establishing secure connection using TLS cert files...');
    const { pk, cert, ca } = readCredsFromCertFiles({
      keyPath,
      certPath,
      caPath,
    });
    return createSecure(pk, cert, ca, serverName, verifyHost);
  } else if (configPath !== undefined) {
    console.log(
      'establishing secure connection using TLS yml configuration...'
    );
    const { pk, cert, ca, serverName, verifyHost } = readCredsFromYml({
      configPath,
    });
    return createSecure(pk, cert, ca, serverName, verifyHost);
  } else {
    console.log('establishing insecure connection...');
    return { credentials: grpc.credentials.createInsecure(), options: {} };
  }
}

function createSecure(pk, cert, ca, serverName, verifyHost) {
  let checkServerIdentity;
  if (verifyHost) {
    checkServerIdentity = (receivedName, cert) => {
      if (!compareCaseInsensitive(receivedName, serverName)) {
        throw new Error(
          `Server name verification error: ${serverName} but received hostname ${receivedName}`
        );
      }
    };
  }

  credentials = grpc.credentials.createSsl(ca, pk, cert, {
    checkServerIdentity,
  });

  const options = {};
  if (serverName) {
    options['grpc.ssl_target_name_override'] = serverName;
  }

  return { credentials, options };
}

module.exports = { getCredentials };
