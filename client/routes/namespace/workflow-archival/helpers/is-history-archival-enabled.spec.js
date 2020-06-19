import isHistoryArchivalEnabled from './is-history-archival-enabled';

describe('isHistoryArchivalEnabled', () => {
  describe('When namespaceSettings is not defined', () => {
    it('should return false.', () => {
      const namespaceSettings = undefined;
      const output = isHistoryArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When namespaceSettings.config.historyArchivalStatus = "DISABLED"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'DISABLED',
        },
      };
      const output = isHistoryArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When namespaceSettings.config.historyArchivalStatus = "ENABLED"', () => {
    it('should return true.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'ENABLED',
        },
      };
      const output = isHistoryArchivalEnabled(namespaceSettings);

      expect(output).toEqual(true);
    });
  });
});
