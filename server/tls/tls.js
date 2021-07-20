const grpc = require('grpc');
const { readCredsFromCertFiles } = require('./read-creds-from-cert-files');
const { readCredsFromConfig } = require('./read-creds-from-config');
const { compareCaseInsensitive } = require('../utils');
const { getTlsConfig } = require('../config');
const logger = require('../logger')

const keyPath = process.env.TEMPORAL_TLS_KEY_PATH;
const certPath = process.env.TEMPORAL_TLS_CERT_PATH;
const caPath = process.env.TEMPORAL_TLS_CA_PATH;
const serverName = process.env.TEMPORAL_TLS_SERVER_NAME;
const verifyHost = [true, 'true', undefined].includes(
  process.env.TEMPORAL_TLS_ENABLE_HOST_VERIFICATION
);
const tlsConfigFile = getTlsConfig()
function getCredentials() {
  if (keyPath !== undefined && certPath !== undefined) {
    logger.log('establishing secure connection using TLS cert files...');
    const { pk, cert, ca } = readCredsFromCertFiles({
      keyPath,
      certPath,
      caPath,
    });
    return createSecure(pk, cert, ca, serverName, verifyHost);
  } else if (caPath !== undefined) {
    logger.log('establishing server-side TLS connection using only TLS CA file...');
    const { ca } = readCredsFromCertFiles({ caPath });
    return createSecure(undefined, undefined, ca, serverName, verifyHost);
  } else if (tlsConfigFile.key) {
    logger.log(
      'establishing secure connection using TLS yml configuration...'
    );
    const { pk, cert, ca, serverName, verifyHost } = readCredsFromConfig();
    return createSecure(pk, cert, ca, serverName, verifyHost);
  } else {
    logger.log('establishing insecure connection...');
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
