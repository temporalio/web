import getHistoryArchivalStatus from './get-history-archival-status';

export default (namespaceSettings) =>
  getHistoryArchivalStatus(namespaceSettings) === 'Enabled';
