import moment from 'moment';

export default function (d) {
  // eslint-disable-next-line no-param-reassign
  d.configuration = d.configuration || {};
  // eslint-disable-next-line no-param-reassign
  d.replicationConfiguration = d.replicationconfiguration || {
    clustersList: [],
  };

  return {
    workflowId: d.execution.workflowid,
    runId: d.execution.runid,
    workflowName: d.type.name,
    startTime: moment(d.starttime).format('lll'),
    endTime: d.closetime ? moment(d.closetime).format('lll') : '',
    status: (`${d.closestatus}` || 'open').toLowerCase(),
  };
}
