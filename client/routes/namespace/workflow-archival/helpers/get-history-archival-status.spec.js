import getHistoryArchivalStatus from './get-history-archival-status';

describe('getHistoryArchivalStatus', () => {
  describe('When namespaceSettings is not defined', () => {
    it('should return "".', () => {
      const namespaceSettings = undefined;
      const output = getHistoryArchivalStatus(namespaceSettings);

      expect(output).toEqual('');
    });
  });

  describe('When namespaceSettings.config.historyArchivalStatus = "ENABLED"', () => {
    it('should return "ENABLED".', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'ENABLED',
        },
      };
      const output = getHistoryArchivalStatus(namespaceSettings);

      expect(output).toEqual('ENABLED');
    });
  });
});
