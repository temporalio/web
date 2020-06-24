import isVisibilityArchivalEnabled from './is-visibility-archival-enabled';

describe('isVisibilityArchivalEnabled', () => {
  describe('When namespaceSettings is not defined', () => {
    it('should return false.', () => {
      const namespaceSettings = undefined;
      const output = isVisibilityArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When namespaceSettings.config.visibilityArchivalStatus = "DISABLED"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          visibilityArchivalStatus: 'DISABLED',
        },
      };
      const output = isVisibilityArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When namespaceSettings.config.visibilityArchivalStatus = "ENABLED"', () => {
    it('should return true.', () => {
      const namespaceSettings = {
        config: {
          visibilityArchivalStatus: 'ENABLED',
        },
      };
      const output = isVisibilityArchivalEnabled(namespaceSettings);

      expect(output).toEqual(true);
    });
  });
});
