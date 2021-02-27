import getHistoryArchivalState from './get-history-archival-state';

export default namespaceSettings =>
  getHistoryArchivalState(namespaceSettings) === 'Enabled';
