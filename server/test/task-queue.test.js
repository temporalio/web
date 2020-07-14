describe('Task Queue Pollers', function() {
  it('should aggregate workflow and activity pollers together by instance', function() {
    this.test.DescribeTaskQueue = ({ request }) => {
      request.namespace.should.equal('canary');
      request.taskQueue.name.should.equal('demo-task-queue');

      return {
        pollers:
          request.taskQueueType === 'Activity'
            ? [
                {
                  identity: '100@node1@demo-task-queue',
                  lastAccessTime: dateToLong('2018-03-22T20:21:40.000Z'),
                },
                {
                  identity: '102@node3@demo-task-queue',
                  lastAccessTime: dateToLong('2018-03-22T20:21:32.000Z'),
                },
              ]
            : [
                {
                  identity: '100@node1@demo-task-queue',
                  lastAccessTime: dateToLong('2018-03-22T20:20:40.000Z'),
                },
                {
                  identity: '101@node2@demo-task-queue',
                  lastAccessTime: dateToLong('2018-03-22T20:22:05.000Z'),
                },
              ],
      };
    };

    return request()
      .get('/api/namespaces/canary/task-queues/demo-task-queue/pollers')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({
        '100@node1@demo-task-queue': {
          lastAccessTime: '2018-03-22T20:21:40.000Z',
          taskQueueTypes: ['command', 'activity'],
        },
        '101@node2@demo-task-queue': {
          lastAccessTime: '2018-03-22T20:22:05.000Z',
          taskQueueTypes: ['command'],
        },
        '102@node3@demo-task-queue': {
          lastAccessTime: '2018-03-22T20:21:32.000Z',
          taskQueueTypes: ['activity'],
        },
      });
  });
});
