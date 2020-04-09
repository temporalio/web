import replaceNamespace from './replace-namespace';

describe('replaceNamespace', () => {
  describe('When message = "message containing {namespace}" and namespaceSettings.namespaceInfo.name = "NamespaceName"', () => {
    it('should return "message containing NamespaceName".', () => {
      const message = 'message containing {namespace}';
      const namespaceSettings = {
        namespaceInfo: {
          name: 'NamespaceName',
        },
      };

      const output = replaceNamespace(message, namespaceSettings);

      expect(output).toEqual('message containing NamespaceName');
    });
  });
});
