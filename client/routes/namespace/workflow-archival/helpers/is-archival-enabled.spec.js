import isArchivalEnabled from './is-archival-enabled';

describe('isArchivalEnabled', () => {
  describe('When historyArchivalStatus = "Disabled" and visibilityArchivalStatus = "Disabled"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'Disabled',
          visibilityArchivalStatus: 'Disabled',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When historyArchivalStatus = "Enabled" and visibilityArchivalStatus = "Disabled"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'Enabled',
          visibilityArchivalStatus: 'Disabled',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When historyArchivalStatus = "Disabled" and visibilityArchivalStatus = "Enabled"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'Disabled',
          visibilityArchivalStatus: 'Enabled',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When historyArchivalStatus = "Enabled" and visibilityArchivalStatus = "Enabled"', () => {
    it('should return true.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalStatus: 'Enabled',
          visibilityArchivalStatus: 'Enabled',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(true);
    });
  });
});
