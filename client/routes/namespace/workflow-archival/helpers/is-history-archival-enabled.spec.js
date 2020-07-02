import isHistoryArchivalEnabled from './is-history-archival-enabled';

describe('isHistoryArchivalEnabled', () => {
  describe('When namespaceSettings is not defined', () => {
    it('should return false.', () => {
      const namespaceSettings = undefined;
      const output = isHistoryArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When namespaceSettings.config.historyArchivalStatus = "Disabled"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'Disabled',
        },
      };
      const output = isHistoryArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When namespaceSettings.config.historyArchivalStatus = "Enabled"', () => {
    it('should return true.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'Enabled',
        },
      };
      const output = isHistoryArchivalEnabled(namespaceSettings);

      expect(output).toEqual(true);
    });
  });
});
