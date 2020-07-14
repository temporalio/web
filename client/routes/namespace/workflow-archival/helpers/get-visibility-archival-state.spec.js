import getVisibilityArchivalState from './get-visibility-archival-state';

describe('getVisibilityArchivalState', () => {
  describe('When namespaceSettings is not defined', () => {
    it('should return "".', () => {
      const namespaceSettings = undefined;
      const output = getVisibilityArchivalState(namespaceSettings);

      expect(output).toEqual('');
    });
  });

  describe('When namespaceSettings.config.visibilityArchivalState = "ENABLED"', () => {
    it('should return "ENABLED".', () => {
      const namespaceSettings = {
        config: {
          visibilityArchivalState: 'ENABLED',
        },
      };
      const output = getVisibilityArchivalState(namespaceSettings);

      expect(output).toEqual('ENABLED');
    });
  });
});
