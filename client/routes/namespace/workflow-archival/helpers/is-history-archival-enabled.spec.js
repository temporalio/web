import isHistoryArchivalEnabled from './is-history-archival-enabled';

describe('isHistoryArchivalEnabled', () => {
  describe('When namespaceSettings is not defined', () => {
    it('should return false.', () => {
      const namespaceSettings = undefined;
      const output = isHistoryArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When namespaceSettings.configuration.historyArchivalStatus = "DISABLED"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        configuration: {
          historyArchivalStatus: 'DISABLED',
        },
      };
      const output = isHistoryArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When namespaceSettings.configuration.historyArchivalStatus = "ENABLED"', () => {
    it('should return true.', () => {
      const namespaceSettings = {
        configuration: {
          historyArchivalStatus: 'ENABLED',
        },
      };
      const output = isHistoryArchivalEnabled(namespaceSettings);

      expect(output).toEqual(true);
    });
  });
});
