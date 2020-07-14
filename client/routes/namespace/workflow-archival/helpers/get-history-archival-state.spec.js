import getHistoryArchivalState from './get-history-archival-state';

describe('getHistoryArchivalState', () => {
  describe('When namespaceSettings is not defined', () => {
    it('should return "".', () => {
      const namespaceSettings = undefined;
      const output = getHistoryArchivalState(namespaceSettings);

      expect(output).toEqual('');
    });
  });

  describe('When namespaceSettings.config.historyArchivalState = "ENABLED"', () => {
    it('should return "ENABLED".', () => {
      const namespaceSettings = {
        config: {
          historyArchivalState: 'ENABLED',
        },
      };
      const output = getHistoryArchivalState(namespaceSettings);

      expect(output).toEqual('ENABLED');
    });
  });
});
