describe('Help', () => {
  async function helpTest(mochaTest) {
    const [testEl, scenario] = new Scenario(mochaTest).startingAt('/help').go();

    const helpEl = await testEl.waitUntilExists('section.help');

    return [helpEl, scenario];
  }

  it('should provide links to learn about temporal', async function test() {
    const [helpEl] = await helpTest(this.test);
    const linksEl = await helpEl.waitUntilExists('section#getting-started');

    linksEl.should.have.descendant('h1').with.text('Welcome to Temporal!');
    linksEl
      .textNodes('a')
      .should.deep.equal([
        'Getting started',
        'Docs',
        'Code Samples',
        'Temporal source code on GitHub',
        'Temporal UI source code on GitHub',
      ]);
  });

  it('should provide links to release notes', async function test() {
    const [helpEl] = await helpTest(this.test);
    const linksEl = await helpEl.waitUntilExists('section#release-notes');

    linksEl
      .textNodes('a')
      .should.deep.equal(['Latest release notes', 'Temporal', 'Temporal UI']);
  });

  it('should provide commands under common CLI commands', async function test() {
    const [helpEl] = await helpTest(this.test);
    const linksEl = await helpEl.waitUntilExists('section#cli');

    linksEl
      .textNodes('pre')
      .should.deep.equal([
        'tctl --namespace {namespace-name} namespace register --global_namespace false',
        'tctl --env {staging|prod|prod02} --namespace {namespace-name} namespace describe',
        'tctl --env {staging|prod|prod02} --namespace {namespace-name} namespace update -active_cluster {cluster-name}',
        'tctl --env {staging|prod|prod02} --namespace {namespace-name} namespace update --add_bad_binary {bad-binary-SHA} --reason \'"{reason}"\'',
        'tctl --env {staging|prod|prod02} --namespace {namespace-name} workflow run --tq {task-queue-name} --wt {workflow-type-name} --et 60 -i \'"{input-string}"\'',
        'tctl --env {staging|prod|prod02} --namespace {namespace-name} workflow describe -w {workflow-id} -r {run-id}',
        'tctl --env {staging|prod|prod02} --namespace {namespace-name} workflow show -w {workflow-id} -r {run-id}',
        'tctl --env {staging|prod|prod02} --namespace {namespace-name} workflow signal -w {workflow-id} -r {run-id} --name {signal-name} --input \'"{signal-payload}"\'',
        'tctl workflow reset -w {workflow-id} -r {run-id} --event_id {event-id} --reason \'"{reason}"\' --reset_type {reset-type} --reset_bad_binary_checksum {bad-binary-SHA}',
        'tctl workflow reset-batch --query \'"{query}"\' --only_non_deterministic --reason \'"{reason}"\' --reset_type {reset-type}',
        'tctl --env {staging|prod|prod02} --namespace {namespace-name} workflow {list|listall}',
        'tctl --env {staging|prod|prod02} --namespace {namespace-name} workflow {list|listall} --open',
        'tctl workflow {list|listall} --query \'(CustomKeywordField = "keyword1" and CustomIntField >= 5) or CustomKeywordField = "keyword2" and CloseTime = missing\'',
      ]);
  });

  it('should provide links to contact temporal team', async function test() {
    const [helpEl] = await helpTest(this.test);
    const linksEl = await helpEl.waitUntilExists('section#contact-us');

    linksEl
      .textNodes('a')
      .should.deep.equal([
        'Contact us',
        'Ask a question on Stack Overflow',
        'Join our discussion group',
        'Join our slack channel',
      ]);
  });
});
