describe('Namespace list', () => {
  it('should show a header bar without a breadcrumb or namespace changer', async function test() {
    const testEl = new Scenario(this.test).render();
    const headerBar = await testEl.waitUntilExists('header.top-bar');

    headerBar.should.have
      .descendant('a.logo svg')
      .and.have.descendant('text')
      .with.text('adence');
    headerBar.should.not.contain('nav').and.not.contain('div.namespace');
  });

  it('should validate the existance of namespaces as the user types', async function test() {
    const [testEl, scenario] = new Scenario(this.test).go();
    const namespaceNav = await testEl.waitUntilExists(
      'section.namespace-search .namespace-navigation'
    );
    const namespaceInput = namespaceNav.querySelector('input');

    namespaceInput.value.should.be.empty;
    namespaceNav.should.have
      .class('validation-unknown')
      .and.not.have.class('.validation-valid');
    namespaceNav.should.not.have.descendant('ul.recent-namespaces');

    scenario.api.getOnce('/api/namespaces/ci-', 404);
    namespaceInput.input('ci-');

    await retry(() => namespaceNav.should.have.class('validation-invalid'));

    await Promise.delay(50);

    namespaceInput.trigger('keydown', { code: 13, keyCode: 13, key: 'Enter' });
    await Promise.delay(50);

    scenario.withNamespaceDescription('ci-tests');
    namespaceInput.input('ci-tests');

    await retry(() => namespaceNav.should.have.class('validation-valid'));
  });

  it('should render the details of a valid namespace', async function test() {
    const [testEl, scenario] = new Scenario(this.test).go();
    const namespaceInput = await testEl.waitUntilExists(
      'section.namespace-search .namespace-navigation input'
    );

    scenario.withNamespaceDescription('ci-tests');
    namespaceInput.input('ci-tests');

    const descriptionEl = await testEl.waitUntilExists(
      'section.namespace-search .namespace-description'
    );

    descriptionEl.should.have
      .descendant('span.namespace-name')
      .with.text('ci-tests');
    descriptionEl
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
    descriptionEl
      .textNodes('dl.details dd')
      .should.deep.equal([
        'A cool namespace',
        'ci-test@uber.com',
        'No',
        '21 days',
        'Yes',
        '0',
        'ci-test-cluster (active)',
      ]);
  });

  it('should go to the workflows of the namespace requested when entered', async function test() {
    const [testEl, scenario] = new Scenario(this.test).go();
    const namespaceInput = await testEl.waitUntilExists(
      'section.namespace-search .namespace-navigation input'
    );

    scenario.withNamespaceDescription('ci-tests');
    namespaceInput.input('ci-tests');

    await testEl.waitUntilExists('.namespace-navigation.validation-valid');
    scenario
      .withNamespace('ci-tests')
      .withWorkflows('open')
      .withNamespaceDescription('ci-tests');
    namespaceInput.trigger('keydown', { code: 13, keyCode: 13, key: 'Enter' });

    await testEl.waitUntilExists('section.workflow-list');
    const headerBar = testEl.querySelector('header.top-bar');

    headerBar.should.have
      .descendant('div.namespace')
      .that.contains.text('ci-test');
    scenario.location.should.contain('/namespaces/ci-tests/workflows');
    localStorage.getItem('recent-namespaces').should.equal('["ci-tests"]');
  });

  it('should activate the change-namespace button when the namespace is valid and navigate to it', async function test() {
    const [testEl, scenario] = new Scenario(this.test).go();
    const namespaceNav = await testEl.waitUntilExists(
      'section.namespace-search .namespace-navigation'
    );
    const namespaceInput = namespaceNav.querySelector('input');
    const changeNamespace = namespaceNav.querySelector('a.change-namespace');

    changeNamespace.should.have.attr('href', '');
    scenario.api.getOnce('/api/namespaces/ci-', 404);
    namespaceInput.input('ci-');

    await retry(() => namespaceNav.should.have.class('validation-invalid'));
    changeNamespace.should.have.attr('href', '');

    await Promise.delay(50);

    scenario.withNamespaceDescription('ci-tests');
    namespaceInput.input('ci-tests');

    await testEl.waitUntilExists('.namespace-navigation.validation-valid');
    changeNamespace.should.have.attr('href', '#');
    scenario
      .withNamespace('ci-tests')
      .withNamespaceDescription('ci-tests')
      .withWorkflows('open');
    changeNamespace.trigger('click');

    await testEl.waitUntilExists('section.workflow-list');
    const headerBar = testEl.querySelector('header.top-bar');

    headerBar.should.have
      .descendant('div.namespace')
      .that.contains.text('ci-test');
    scenario.location.should.contain('/namespaces/ci-tests/workflows');
    localStorage.getItem('recent-namespaces').should.equal('["ci-tests"]');

    await Promise.delay(100);
  });

  it('should show recent namespaces with links to them', async function test() {
    localStorage.setItem(
      'recent-namespaces',
      JSON.stringify(['demo', 'ci-tests'])
    );
    const [testEl, scenario] = new Scenario(this.test).go();
    const recentNamespaces = await testEl.waitUntilExists(
      '.namespace-navigation ul.recent-namespaces'
    );

    recentNamespaces.should.have
      .descendant('h3')
      .with.trimmed.text('Recent Namespaces');
    recentNamespaces.textNodes('li a').should.deep.equal(['demo', 'ci-tests']);

    recentNamespaces.querySelectorAll('li a')[1].trigger('click');
    scenario
      .withNamespace('ci-tests')
      .withNamespaceDescription('ci-tests')
      .withWorkflows('open');

    await testEl.waitUntilExists('section.workflow-list');
    localStorage
      .getItem('recent-namespaces')
      .should.equal('["ci-tests","demo"]');
  });

  it('should show a description of recent namespaces when hovered', async function test() {
    localStorage.setItem(
      'recent-namespaces',
      JSON.stringify(['demo', 'ci-tests'])
    );
    const [testEl, scenario] = new Scenario(this.test).go();
    const recentNamespaces = await testEl.waitUntilExists(
      '.namespace-navigation ul.recent-namespaces'
    );

    scenario.withNamespaceDescription('demo', {
      namespaceInfo: { description: 'demo playground' },
      config: { workflowExecutionRetentionPeriodInDays: 3 },
    });
    recentNamespaces.querySelectorAll('li a')[0].trigger('mouseover');

    const descriptionEl = await testEl.waitUntilExists(
      'section.namespace-search .namespace-description'
    );

    descriptionEl
      .textNodes('dl.details dd')
      .should.deep.equal([
        'demo playground',
        'ci-test@uber.com',
        'No',
        '3 days',
        'Yes',
        '0',
        'ci-test-cluster (active)',
      ]);
  });
});
