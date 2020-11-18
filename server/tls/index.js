const grpc = require('grpc');
const { readFileSync } = require('fs');

function getCredentials() {
  if (process.env.TEMPORAL_TLS_KEY_PATH === undefined) {
    console.log('establishing insecure connection...');
    return { credentials: grpc.credentials.createInsecure(), options: {} };
  }

  console.log('establishing secure connection using TLS...');

  let credentials;
  if (process.env.TEMPORAL_TLS_CERT_PATH === undefined) {
    throw Error('TLS certificate is not provided');
  }

  const pk = readFileSync(process.env.TEMPORAL_TLS_KEY_PATH);
  const cert = readFileSync(process.env.TEMPORAL_TLS_CERT_PATH);

  let ca;
  if (process.env.TEMPORAL_TLS_CA_PATH) {
    ca = process.env.TEMPORAL_TLS_CA_PATH;
    caContent = readFileSync(ca);
  }

  let verifyHost = false;
  let checkServerIdentity;
  if (process.env.TEMPORAL_TLS_ENABLE_HOST_VERIFICATION in [true, 'true']) {
    checkServerIdentity = (hostname, cert) => {
      if (hostname !== process.env.TEMPORAL_TLS_SERVER_NAME) {
        return new Error('Server name verification error');
      }
    };
  }

  credentials = grpc.credentials.createSsl(
    ca ? caContent : undefined,
    pk,
    cert,
    {
      checkServerIdentity: verifyHost ? checkServerIdentity : undefined,
    }
  );

  const options = {};
  if (process.env.TEMPORAL_TLS_SERVER_NAME) {
    options['grpc.ssl_target_name_override'] =
      process.env.TEMPORAL_TLS_SERVER_NAME;
  }

  return { credentials, options };
}

module.exports = { getCredentials };
