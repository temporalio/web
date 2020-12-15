const grpc = require('grpc');
const { readFileSync } = require('fs');
const yaml = require('js-yaml');

function readCredsFromYml({ configPath }) {
  if (configPath === undefined) {
    throw Error('TLS config path is not provided');
  }

  let credentials;

  const configRaw = readFileSync(configPath);
  config = yaml.safeLoad(configRaw);

  const {
    key: keyBase64,
    cert: certBase64,
    clientca: caBase64,
    hostname,
  } = config;

  if (!keyBase64) {
    throw Error('TLS key is not provided');
  }

  if (!certBase64) {
    throw Error('TLS certificate is not provided');
  }

  const pk = Buffer.from(keyBase64, 'base64');
  const cert = Buffer.from(certBase64, 'base64');
  const ca = caBase64 ? Buffer.from(caBase64, 'base64') : undefined;

  let checkServerIdentity;
  if (hostname) {
    checkServerIdentity = (receivedName, cert) => {
      if (receivedName !== hostname) {
        throw new Error(
          `Server name verification error: ${hostname} but received hostname ${receivedName}`
        );
      }
    };
  }

  credentials = grpc.credentials.createSsl(ca, pk, cert, {
    checkServerIdentity,
  });

  const options = {};
  if (hostname) {
    options['grpc.ssl_target_name_override'] = hostname;
  }

  return { credentials, options };
}

module.exports = { readCredsFromYml };
