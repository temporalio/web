const { promisify } = require('util');
const { readFile } = require('fs');
const yaml = require('js-yaml');

let config = undefined;

const readConfig = async () => {
  if (!config) {
    const cfgContents = await promisify(readFile)('./server/config.yml', {
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

module.exports = {
  getAuthConfig,
};
