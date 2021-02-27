import getVisibilityArchivalState from './get-visibility-archival-state';

export default namespaceSettings =>
  getVisibilityArchivalState(namespaceSettings) === 'Enabled';
