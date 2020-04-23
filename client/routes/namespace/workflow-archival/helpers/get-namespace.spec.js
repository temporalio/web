import getNamespace from './get-namespace';

describe('getNamespace', () => {
  describe('When namespaceSettings is not defined', () => {
    it('should return "".', () => {
      const namespaceSettings = undefined;
      const output = getNamespace(namespaceSettings);

      expect(output).toEqual('');
    });
  });

  describe('When namespaceSettings.namespaceInfo.name = "NamespaceName"', () => {
    it('should return "NamespaceName".', () => {
      const namespaceSettings = {
        namespaceInfo: {
          name: 'NamespaceName',
        },
      };
      const output = getNamespace(namespaceSettings);

      expect(output).toEqual('NamespaceName');
    });
  });
});
