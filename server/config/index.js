const { promisify } = require('util');
const { readFile } = require('fs');
const yaml = require('js-yaml');

let config = undefined;
const configPath = process.env.TEMPORAL_CONFIG_PATH || './server/config.yml';

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
  let { routing } = await readConfig();
  if (!routing) {
    return { defaultToNamespace: null };
  }

  routing.defaultToNamespace =
    routing.default_to_namespace || routing.defaultToNamespace;
  delete routing.default_to_namespace
  
  return routing;
};

module.exports = {
  getAuthConfig,
  getRoutingConfig,
};
