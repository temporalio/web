describe('Describe Namespace', function() {
  it('should list namespaces', async function() {
    const namespaces = [
      {
        namespaceInfo: {
          name: 'ci-test-namespace',
          status: 'REGISTERED',
          description: 'namespace for running CI tests',
          ownerEmail: 'temporal-dev@temporalio.com',
          data: null,
          uuid: null,
        },
        isGlobalNamespace: false,
        failoverVersion: 0,
        config: {
          badBinaries: null,
          historyArchivalState: null,
          historyArchivalURI: null,
          visibilityArchivalState: null,
          visibilityArchivalURI: null,
          workflowExecutionRetentionTtl: { duration: 14 * 60 * 60 },
        },
        replicationConfig: {
          activeClusterName: 'ci-cluster',
          clusters: [],
        },
      },
    ];

    this.test.ListNamespaces = ({ listRequest }) => {
      should.not.exist(listRequest.nextPageToken);
      return { namespaces };
    };

    return request()
      .get('/api/namespaces')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ namespaces, nextPageToken: null });
  });

  it('should describe the namespace', async function() {
    const namespaceDesc = {
      namespaceInfo: {
        name: 'test-namespace',
        status: 'REGISTERED',
        description: 'ci test namespace',
        ownerEmail: null,
        data: {},
        uuid: null,
      },
      failoverVersion: 0,
      isGlobalNamespace: true,
      config: {
        badBinaries: null,
        workflowExecutionRetentionTtl: { duration: 14 * 60 * 60 },
        historyArchivalState: null,
        historyArchivalURI: null,
        visibilityArchivalState: null,
        visibilityArchivalURI: null,
      },
      replicationConfig: {
        activeClusterName: 'ci-cluster',
        clusters: null,
      },
    };

    this.test.DescribeNamespace = ({ describeRequest }) => {
      describeRequest.name.should.equal('test-namespace');
      return namespaceDesc;
    };

    return request()
      .get('/api/namespaces/test-namespace')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(namespaceDesc);
  });

  it('should return 404 if the namespace is not found', async function() {
    this.test.DescribeNamespace = ({ describeRequest }) => ({
      ok: false,
      body: { message: `namespace "${describeRequest.name}" does not exist` },
      typeName: 'entityNotExistError',
    });

    return request()
      .get('/api/namespaces/nonexistant')
      .expect(404)
      .expect('Content-Type', /json/)
      .expect({
        message: 'namespace "nonexistant" does not exist',
      });
  });
});
