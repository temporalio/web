const grpc = require('grpc');
const { readCredsFromCertFiles } = require('./read-creds-from-cert-files');
const { readCredsFromConfig } = require('./read-creds-from-config');
const { compareCaseInsensitive } = require('../utils');
const { getTlsConfig: getTlsCredsFromConfig } = require('../config');
const logger = require('../logger');

const keyPath = process.env.TEMPORAL_TLS_KEY_PATH;
const certPath = process.env.TEMPORAL_TLS_CERT_PATH;
const caPath = process.env.TEMPORAL_TLS_CA_PATH;
const serverName = process.env.TEMPORAL_TLS_SERVER_NAME;
const verifyHost = [true, 'true', undefined].includes(
  process.env.TEMPORAL_TLS_ENABLE_HOST_VERIFICATION
);

function getGrpcCredentials(tlsCreds) {
  if (!tlsCreds || (!tlsCreds.pk && !tlsCreds.ca)) {
    logger.log('will use insecure connection with Temporal server...');
    return { credentials: grpc.credentials.createInsecure(), options: {} };
  } else if (tlsCreds.pk) {
    logger.log('will use mTLS connection with Temporal server...');
  } else if (tlsCreds.ca) {
    logger.log('will use server-side TLS connection with Temporal server...');
  }

  return createSecure(tlsCreds);
}

function getTlsCredentials() {
  const tlsConfigFile = getTlsCredsFromConfig();

  let tls = {};
  if (keyPath !== undefined && certPath !== undefined) {
    tls = readCredsFromCertFiles({
      keyPath,
      certPath,
      caPath,
    });
  } else if (caPath !== undefined) {
    tls = readCredsFromCertFiles({ caPath });
  } else if (tlsConfigFile.key) {
    tls = readCredsFromConfig();
  }

  return {
    pk: tls.pk,
    cert: tls.cert,
    ca: tls.ca,
    serverName: tls.serverName || serverName,
    verifyHost: tls.verifyHost || verifyHost,
  };
}

function createSecure({ pk, cert, ca, serverName, verifyHost }) {
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

module.exports = { getTlsCredentials, getGrpcCredentials };
