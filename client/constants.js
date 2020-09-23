export const failureKeys = ['failure', 'lastFailure'];
export const jsonKeys = [
  'result',
  'input',
  'details',
  'heartbeatDetails',
  'data',
  'payloads',
];
export const preKeys = [
  'stackTrace',
  'details.stackTrace',
  ...jsonKeys,
  ...failureKeys,
];

export const ENVIRONMENT_LIST = [
  // Make sure to enable "environment-select" in feature-flags.json to enable environment select.
  //
  // Examples:
  //
  // {
  //   label: 'Production',
  //   value: 'http://<production-url>.com',
  // },
  // {
  //   label: 'Staging',
  //   value: 'http://<staging-url>.com',
  // },
  // {
  //   label: 'Development',
  //   value: 'http://<development-url>.com',
  // },
  // {
  //   label: 'Localhost',
  //   value: 'http://localhost:8088',
  // },
];

export const NOTIFICATION_TYPE_ERROR = 'error';
export const NOTIFICATION_TYPE_ERROR_MESSAGE_DEFAULT =
  'An unexpected error has occurred. Please try again. If problems persist contact temporal-support.';
export const NOTIFICATION_TYPE_SUCCESS = 'success';
export const NOTIFICATION_TYPE_WARNING = 'warning';
export const NOTIFICATION_TIMEOUT = 5000;
