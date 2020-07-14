import isArchivalEnabled from './is-archival-enabled';

describe('isArchivalEnabled', () => {
  describe('When historyArchivalState = "Disabled" and visibilityArchivalState = "Disabled"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalState: 'Disabled',
          visibilityArchivalState: 'Disabled',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When historyArchivalState = "Enabled" and visibilityArchivalState = "Disabled"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalState: 'Enabled',
          visibilityArchivalState: 'Disabled',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When historyArchivalState = "Disabled" and visibilityArchivalState = "Enabled"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalState: 'Disabled',
          visibilityArchivalState: 'Enabled',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When historyArchivalState = "Enabled" and visibilityArchivalState = "Enabled"', () => {
    it('should return true.', () => {
      const namespaceSettings = {
        config: {
          historyArchivalState: 'Enabled',
          visibilityArchivalState: 'Enabled',
        },
      };
      const output = isArchivalEnabled(namespaceSettings);

      expect(output).toEqual(true);
    });
  });
});
