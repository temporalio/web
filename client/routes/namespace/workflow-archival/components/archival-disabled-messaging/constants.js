export const archivalDisabledMessage = [
  'This namespace is currently not enabled for archival.',
  'To enable archival:',
];

export const historyArchivalDisabledMessage =
  'Set HistoryArchivalState to ENABLED by running command:';

export const historyArchivalEnableCommand = `tctl --ns {namespace} namespace update -has enabled`;

export const historyArchivalLinks = null;

export const visibilityArchivalDisabledMessage =
  'Set VisibilityArchivalState to ENABLED by running command:';

export const visibilityArchivalEnableCommand = `tctl --ns {namespace} namespace update -vas enabled`;
