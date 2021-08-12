const logger = require('./logger');
const {
  TemporalClient,
  WithAuthMetadata,
  WithErrorConverter,
} = require('./temporal-client');
const { getTlsCredentials } = require('./tls');
const { getTlsConfig } = require('./config');

let refreshInterval = Number(process.env.TEMPORAL_TLS_REFRESH_INTERVAL) || 0;

if (refreshInterval === 0) {
  const tls = getTlsConfig();
  if (tls.refreshInterval) {
    refreshInterval = Number(tls.refreshInterval);
  }
}

let tlsCache;
let tClient;

loadClient();

if (refreshInterval !== 0) {
  setInterval(() => {
    try {
      const tls = getTlsCredentials();
      if (
        !equal(tls.pk, tlsCache.pk) ||
        !equal(tls.cert, tlsCache.cert) ||
        !equal(tls.ca, tlsCache.ca) ||
        tls.serverName !== tlsCache.serverName ||
        tls.verifyHost !== tlsCache.verifyHost
      ) {
        loadClient();
      }
    } catch (err) {
      logger.error(err);
    }
  }, refreshInterval * 1000);
}

getTemporalClient = () => tClient;

function loadClient() {
  tlsCache = getTlsCredentials();
  tClient = WithErrorConverter(WithAuthMetadata(new TemporalClient(tlsCache)));
}

function equal(v1, v2) {
  if (Buffer.isBuffer(v1)) {
    if (Buffer.isBuffer(v2)) {
      return Buffer.compare(v1, v2) === 0;
    }
    return false;
  } else if (Buffer.isBuffer(v2)) {
    return false;
  } else {
    return v1 === v2;
  }
}

module.exports = { getTemporalClient };
