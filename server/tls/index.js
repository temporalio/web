const grpc = require('grpc');
const { readCredsFromCertFiles } = require('./read-creds-from-cert-files');
const { readCredsFromYml } = require('./read-creds-from-yml-file');

const keyPath = process.env.TEMPORAL_TLS_KEY_PATH;
const certPath = process.env.TEMPORAL_TLS_CERT_PATH;
const caPath = process.env.TEMPORAL_TLS_CA_PATH;
const serverName = process.env.TEMPORAL_TLS_SERVER_NAME;
const verifyHost = [true, 'true', undefined].includes(
  process.env.TEMPORAL_TLS_ENABLE_HOST_VERIFICATION
);
const configPath = process.env.TEMPORAL_TLS_CONFIG_PATH;

function getCredentials() {
  if (keyPath !== undefined) {
    console.log('establishing secure connection using TLS cert files...');
    return readCredsFromCertFiles({
      keyPath,
      certPath,
      caPath, 
      serverName,
      verifyHost,
    });
  } else if (configPath !== undefined) {
    console.log(
      'establishing secure connection using TLS yml configuration...'
    );
    return readCredsFromYml({ configPath });
  } else {
    console.log('establishing insecure connection...');
    return { credentials: grpc.credentials.createInsecure(), options: {} };
  }
}

module.exports = { getCredentials };
