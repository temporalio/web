import isHistoryArchivalEnabled from './is-history-archival-enabled';
import isVisibilityArchivalEnabled from './is-visibility-archival-enabled';

export default namespaceSettings =>
  isHistoryArchivalEnabled(namespaceSettings) &&
  isVisibilityArchivalEnabled(namespaceSettings);
