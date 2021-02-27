import moment from 'moment';

describe('Task Queue', () => {
  async function taskQueueTest(mochaTest, pollers) {
    const [testEl, scenario] = new Scenario(mochaTest)
      .withNamespace('ci-test')
      .startingAt('/namespaces/ci-test/task-queues/ci_task_queue')
      .withTaskQueuePollers('ci_task_queue', pollers)
      .go();

    const taskQueueEl = await testEl.waitUntilExists('section.task-queue');

    return [taskQueueEl, scenario];
  }

  it('should show a table of the pollers of the task queue', async function test() {
    const [taskQueueEl] = await taskQueueTest(this.test);

    await Promise.delay(1);

    taskQueueEl.querySelectorAll('table tbody tr').should.have.length(3);
    taskQueueEl
      .textNodes('tbody tr td:first-child')
      .should.deep.equal(['node1', 'node2', 'node3']);
    taskQueueEl.textNodes('tbody tr td:nth-child(2)').should.deep.equal(
      [5, 3, 4].map(m =>
        moment()
          .startOf('hour')
          .add(m, 'minutes')
          .format('ddd MMMM Do, h:mm:ss a')
      )
    );
    taskQueueEl
      .attrValues('tbody td:nth-child(3)', 'data-handled')
      .should.deep.equal(['true', 'true', null]);
    taskQueueEl
      .attrValues('tbody td:nth-child(4)', 'data-handled')
      .should.deep.equal(['true', null, 'true']);
  });
});
