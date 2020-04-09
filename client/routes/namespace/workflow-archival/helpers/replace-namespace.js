import getNamespace from './get-namespace';

export default (message, namespaceSettings) =>
  message.replace(/\{namespace\}/, getNamespace(namespaceSettings));
