describe('Namespace Configuration', () => {
  async function namespaceConfigTest(mochaTest, desc) {
    const [testEl, scenario] = new Scenario(mochaTest)
      .withNamespace('ci-test')
      .startingAt('/namespaces/ci-test/config')
      .withNamespaceDescription('ci-test', desc)
      .go();

    const configEl = await testEl.waitUntilExists('section.namespace-config');

    return [configEl, scenario];
  }

  it('should show properties in a readable form from the namespace description API', async function test() {
    const [configEl] = await namespaceConfigTest(this.test);

    await configEl.waitUntilExists('dl.details dt');
    configEl.should.have.descendant('header h3').with.text('ci-test');
    configEl
      .textNodes('dl.details dt')
      .should.deep.equal([
        'description',
        'owner',
        'Global?',
        'Retention Period',
        'Emit Metrics',
        'Failover Version',
        'clusters',
      ]);
    configEl
      .textNodes('dl.details dd')
      .should.deep.equal([
        'A cool namespace',
        'ci-test@temporalio.com',
        'No',
        '21 days',
        'Yes',
        '0',
        'ci-test-cluster (active)',
      ]);
  });
});
