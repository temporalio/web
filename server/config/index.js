const { promisify } = require('util');
const { readFile } = require('fs');
const yaml = require('js-yaml');

const readConfig = async () => {
  const cfgContents = await promisify(readFile)('./server/config.yml', {
    encoding: 'utf8',
  });
  const config = yaml.safeLoad(cfgContents);
  return config;
};

const getAuthConfig = async () => {
  let { auth } = await readConfig();
  if (!auth) {
    return [];
  }
  return auth;
};

const isAuthEnabled = async () => {
  const auth = await getAuthConfig();
  return auth.length > 0;
};

module.exports = {
  isAuthEnabled,
  getAuthConfig,
};
