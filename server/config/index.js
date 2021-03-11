const { promisify } = require('util');
const { readFile, readFileSync } = require('fs');
const yaml = require('js-yaml');

let config = undefined;
const configPath = process.env.TEMPORAL_CONFIG_PATH || './server/config.yml';

const readConfigSync = () => {
  if (!config) {
    const cfgContents = readFileSync(configPath, {
      encoding: 'utf8',
    });
    config = yaml.safeLoad(cfgContents);
  }
  return config;
};

const readConfig = async () => {
  if (!config) {
    const cfgContents = await promisify(readFile)(configPath, {
      encoding: 'utf8',
    });
    config = yaml.safeLoad(cfgContents);
  }
  return config;
};

const getAuthConfig = async () => {
  let { auth } = await readConfig();
  if (!auth) {
    return { enabled: false };
  }
  return auth;
};

const getRoutingConfig = async () => {
  const { routing } = await readConfig();

  if (!routing) {
    return { defaultToNamespace: null, issueReportLink: null };
  }

  // backwards compatibility fix
  routing.default_to_namespace =
    routing.default_to_namespace || routing.defaultToNamespace;

  const { default_to_namespace, issue_report_link } = routing;

  return {
    defaultToNamespace: default_to_namespace,
    issueReportLink: issue_report_link,
  };
};

const getTlsConfig = () => {
  let { tls } = readConfigSync();

  if (!tls) {
    tls = {};
  }

  const { ca, key, cert, server_name, verify_host } = tls;

  return {
    ca,
    key,
    cert,
    serverName: server_name,
    verifyHost: verify_host,
  };
};

module.exports = {
  getAuthConfig,
  getRoutingConfig,
  getTlsConfig,
};
