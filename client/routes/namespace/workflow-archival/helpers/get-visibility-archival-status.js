import get from 'lodash-es/get';

export default namespaceSettings =>
  get(namespaceSettings, 'config.visibilityArchivalStatus', '');
