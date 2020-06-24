import isArchivalEnabled from './is-archival-enabled';

describe('isArchivalEnabled', () => {
  describe('When historyArchivalStatus = "DISABLED" and visibilityArchivalStatus = "DISABLED"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'DISABLED',
          visibilityArchivalStatus: 'DISABLED',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When historyArchivalStatus = "ENABLED" and visibilityArchivalStatus = "DISABLED"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'ENABLED',
          visibilityArchivalStatus: 'DISABLED',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When historyArchivalStatus = "DISABLED" and visibilityArchivalStatus = "ENABLED"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'DISABLED',
          visibilityArchivalStatus: 'ENABLED',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When historyArchivalStatus = "ENABLED" and visibilityArchivalStatus = "ENABLED"', () => {
    it('should return true.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'ENABLED',
          visibilityArchivalStatus: 'ENABLED',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(true);
    });
  });
});
