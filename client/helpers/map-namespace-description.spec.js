import mapNamespaceDescription from './map-namespace-description';

describe('mapNamespaceDescription', () => {
  describe('When namespace is empty', () => {
    let namespace;

    beforeEach(() => {
      namespace = undefined;
    });

    it('should return "Global?" = "No".', () => {
      const output = mapNamespaceDescription(namespace);

      expect(output['Global?']).toEqual('No');
    });

    it('should return "History Archival" = "Disabled".', () => {
      const output = mapNamespaceDescription(namespace);

      expect(output['History Archival']).toEqual('Disabled');
    });

    it('should return "Retention Period" = "Unknown".', () => {
      const output = mapNamespaceDescription(namespace);

      expect(output['Retention Period']).toEqual('Unknown');
    });

    it('should return "Visibility Archival" = "Disabled".', () => {
      const output = mapNamespaceDescription(namespace);

      expect(output['History Archival']).toEqual('Disabled');
    });

    it('should return "clusters" = "Unknown".', () => {
      const output = mapNamespaceDescription(namespace);

      expect(output.clusters).toEqual('Unknown');
    });

    it('should return "description" = "No description available".', () => {
      const output = mapNamespaceDescription(namespace);

      expect(output.description).toEqual('No description available');
    });

    it('should return "owner" = "Unknown".', () => {
      const output = mapNamespaceDescription(namespace);

      expect(output.owner).toEqual('Unknown');
    });
  });

  describe('When namespace.namespaceInfo.description = "NamespaceDescription"', () => {
    it('should return "description" = "NamespaceDescription".', () => {
      const namespace = {
        namespaceInfo: {
          description: 'NamespaceDescription',
        },
      };

      const output = mapNamespaceDescription(namespace);

      expect(output.description).toEqual('NamespaceDescription');
    });
  });

  describe('When namespace.namespaceInfo.ownerEmail = "OwnerEmail"', () => {
    it('should return "owner" = "OwnerEmail".', () => {
      const namespace = {
        namespaceInfo: {
          ownerEmail: 'OwnerEmail',
        },
      };

      const output = mapNamespaceDescription(namespace);

      expect(output.owner).toEqual('OwnerEmail');
    });
  });

  describe('When namespace.isGlobalNamespace = true', () => {
    it('should return "Global?" = "Yes".', () => {
      const namespace = {
        isGlobalNamespace: true,
      };

      const output = mapNamespaceDescription(namespace);

      expect(output['Global?']).toEqual('Yes');
    });
  });

  describe('When namespace.config.workflowExecutionRetentionTtl = 3 days', () => {
    it('should return "Retention Period" = "3 days".', () => {
      const namespace = {
        config: {
          workflowExecutionRetentionTtl: { duration: 3 * 24 * 60 * 60 },
        },
      };

      const output = mapNamespaceDescription(namespace);

      expect(output['Retention Period']).toEqual('3 days');
    });
  });

  describe('When namespace.config.historyArchivalState = "Enabled"', () => {
    it('should return "History Archival" = "Enabled".', () => {
      const namespace = {
        config: {
          historyArchivalState: 'Enabled',
        },
      };

      const output = mapNamespaceDescription(namespace);

      expect(output['History Archival']).toEqual('Enabled');
    });
  });

  describe('When namespace.config.visibilityArchivalState = "Enabled"', () => {
    it('should return "Visibility Archival" = "Enabled".', () => {
      const namespace = {
        config: {
          visibilityArchivalState: 'Enabled',
        },
      };

      const output = mapNamespaceDescription(namespace);

      expect(output['Visibility Archival']).toEqual('Enabled');
    });
  });

  describe('When namespace.failoverVersion = 1', () => {
    it('should return "Failover Version" = 1', () => {
      const namespace = {
        failoverVersion: 1,
      };

      const output = mapNamespaceDescription(namespace);

      expect(output['Failover Version']).toEqual(1);
    });
  });

  describe(`Multiple clusters with one active cluster`, () => {
    it('should return "clusters" = "cluster1 (active), cluster2".', () => {
      const namespace = {
        replicationConfig: {
          activeClusterName: 'cluster1',
          clusters: [{ clusterName: 'cluster1' }, { clusterName: 'cluster2' }],
        },
      };

      const output = mapNamespaceDescription(namespace);

      expect(output.clusters).toEqual('cluster1 (active), cluster2');
    });
  });
});
