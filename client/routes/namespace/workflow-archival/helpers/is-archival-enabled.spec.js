import isArchivalEnabled from './is-archival-enabled';

describe('isArchivalEnabled', () => {
  describe('When historyArchivalStatus = "DISABLED" and visibilityArchivalStatus = "DISABLED"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        configuration: {
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
        configuration: {
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
        configuration: {
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
        configuration: {
          historyArchivalStatus: 'ENABLED',
          visibilityArchivalStatus: 'ENABLED',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(true);
    });
  });
});
