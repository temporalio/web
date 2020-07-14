import isVisibilityArchivalEnabled from './is-visibility-archival-enabled';

describe('isVisibilityArchivalEnabled', () => {
  describe('When namespaceSettings is not defined', () => {
    it('should return false.', () => {
      const namespaceSettings = undefined;
      const output = isVisibilityArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When namespaceSettings.config.visibilityArchivalState = "Disabled"', () => {
    it('should return false.', () => {
      const namespaceSettings = {
        config: {
          visibilityArchivalState: 'Disabled',
        },
      };
      const output = isVisibilityArchivalEnabled(namespaceSettings);

      expect(output).toEqual(false);
    });
  });

  describe('When namespaceSettings.config.visibilityArchivalState = "Enabled"', () => {
    it('should return true.', () => {
      const namespaceSettings = {
        config: {
          visibilityArchivalState: 'Enabled',
        },
      };
      const output = isVisibilityArchivalEnabled(namespaceSettings);

      expect(output).toEqual(true);
    });
  });
});
