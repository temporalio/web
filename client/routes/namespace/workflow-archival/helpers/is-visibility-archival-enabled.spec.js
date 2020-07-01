import isVisibilityArchivalEnabled from './is-visibility-archival-enabled';

describe('isVisibilityArchivalEnabled', () => {
  describe('When namespaceSettings is not defined', () => {
    it('should return false.', () => {
      const namespaceSettings = undefined;
      const output = isVisibilityArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When namespaceSettings.config.visibilityArchivalStatus = "Disabled"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          visibilityArchivalStatus: 'Disabled',
        },
      };
      const output = isVisibilityArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When namespaceSettings.config.visibilityArchivalStatus = "Enabled"', () => {
    it('should return true.', () => {
      const namespaceSettings = {
        config: {
          visibilityArchivalStatus: 'Enabled',
        },
      };
      const output = isVisibilityArchivalEnabled(namespaceSettings);

      expect(output).toEqual(true);
    });
  });
});
