import getVisibilityArchivalStatus from './get-visibility-archival-status';

export default (namespaceSettings) =>
  getVisibilityArchivalStatus(namespaceSettings) === 'Enabled';
