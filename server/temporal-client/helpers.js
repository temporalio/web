const Long = require('long');
const losslessJSON = require('lossless-json');
const moment = require('moment');
const { logger } = require('../logger')

function buildHistory(getHistoryRes) {
  const history = getHistoryRes.history;

  history.events = getHistoryRes.history.events.map(e => {
    let attr = '';

    if (e.eventType) {
      attr = e.eventType + 'EventAttributes';
      attr = attr.replace(/^./, function(v) {
        return v.toLowerCase();
      });
    }

    return {
      eventTime: e.eventTime,
      eventType: e.eventType,
      eventId: e.eventId,
      details: e[attr],
    };
  });

  return history;
}

function buildWorkflowExecutionRequest(execution) {
  const req = { workflowId: execution.workflowId };

  if (execution.runId) {
    req.runId = Buffer.from(execution.runId);
  }

  return req;
}

function momentToProtoTime(time) {
  return {
    seconds: time / 1000,
    nanos: (time % 1000) * 1e6,
  };
}

const [_searchAttributes, _memo, _queryResult, _payloads] = [
  'searchAttributes',
  'memo',
  'queryResult',
  'payloads',
];
const _uiTransformPayloadKeys = [
  _searchAttributes,
  _memo,
  _queryResult,
  _payloads,
];

function uiTransform(item, rawPayloads = false, transformingPayloads = false) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  Object.entries(item).forEach(([subkey, subvalue]) => {
    if (subvalue && subvalue.seconds) {
      const seconds = Number(subvalue.seconds);

      item[subkey] = { duration: seconds };

      const dt = moment(seconds * 1000);

      if (dt.isValid() && dt.isAfter('2017-01-01')) {
        item[subkey] = dt.toISOString();
      }
    } else if (Buffer.isBuffer(subvalue)) {
      if (subkey === 'nextPageToken') {
        item.nextPageToken = subvalue.toString('base64');

        return;
      }

      if (rawPayloads && transformingPayloads) {
        item[subkey] = subvalue.toString('base64');

        return;
      }

      const stringval = subvalue.toString('utf8');

      try {
        // most of Temporal's uses of buffer is just line-delimited JSON.
        item[subkey] = stringval
          .split('\n')
          .filter(x => x)
          .map(JSON.parse);

        if (item[subkey].length === 1) {
          item[subkey] = item[subkey][0];
        }
      } catch (e) {
        item[`${subkey}_base64`] = subvalue.toString('base64');
        item[subkey] = stringval;
      }
    } else if (Array.isArray(subvalue)) {
      if (subkey === _payloads && rawPayloads) {
        subvalue.forEach(function(item) {
          uiTransform(item, rawPayloads, true);
        });
      } else if (subkey === _payloads) {
        let payloads = [];

        Object.entries(subvalue).forEach(([subkey, payload]) => {
          if (!payload.metadata.encoding || !payload.data) {
            return;
          }

          let encoding = payload.metadata.encoding;
          let data = payload.data;

          try {
            encoding = Buffer.from(encoding).toString();

            if (['json/plain', 'json/protobuf'].includes(encoding)) {
              data = JSON.parse(Buffer.from(data).toString());
            } else {
              data = Buffer.from(data).toString('base64');

              data = data.length > 20 ? `${data.slice(0, 20)}..` : data;
            }

            payloads = [...payloads, data];
          } catch (error) {
            logger.log(
              `Unable to process payload. Encoding: ${encoding}, data: ${data}. ${error}`
            );
            payloads = [...payloads, data.toString()];
          }
        });
        item[_payloads] = payloads;
      } else {
        subvalue.forEach(function(item) {
          uiTransform(item, rawPayloads);
        });
      }
    } else if (typeof subvalue == 'string') {
      subvalue = enumTransform(subvalue);
      item[subkey] = subvalue;
    } else if (subvalue && typeof subvalue === 'object') {
      if (_uiTransformPayloadKeys.includes(subkey)) {
        if (subkey === _searchAttributes) {
          const values = {};

          Object.entries(subvalue.indexedFields).forEach(
            ([subkey, subvalue]) => {
              values[subkey] = subvalue.data.toString('utf8');
            }
          );
          item[subkey] = values;
        } else if (subkey === _memo) {
          let values = [];

          Object.entries(subvalue.fields).forEach(([subkey, subvalue]) => {
            values = [...values, subvalue.data.toString('utf8')];
          });
          item[subkey] = values;
        } else {
          uiTransform(subvalue, rawPayloads, transformingPayloads);
        }
      } else {
        uiTransform(subvalue, rawPayloads, transformingPayloads);
      }
    }
  });

  return item;
}

function enumTransform(item) {
  const enumPrefixes = [
    'workflow_execution_status',
    'event_type',
    'task_queue_kind',
    'continue_as_new_initiator',
    'timeout_type',
    'archival_state',
    'retry_state',
    'severity',
    'pending_activity_state',
  ];

  const itemL = item.toLowerCase();

  prefix = enumPrefixes.find(e => itemL.startsWith(e));

  if (!prefix) {
    return item;
  }

  let processed = itemL.replace(new RegExp(`^${prefix}`), '');

  processed = processed.replace(/\_\w/g, function(v) {
    return v[1].toUpperCase();
  });

  return processed;
}

function cliTransform(item) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  Object.entries(item).forEach(([subkey, subvalue]) => {
    if (subvalue && typeof subvalue.unsigned === 'boolean') {
      item[subkey] = new losslessJSON.LosslessNumber(
        Long.fromValue(subvalue).toString()
      );
    } else if (Buffer.isBuffer(subvalue)) {
      item[subkey] = subvalue.toString('base64');
    } else if (Array.isArray(subvalue)) {
      subvalue.forEach(cliTransform);
    } else if (subvalue && typeof subvalue === 'object') {
      cliTransform(subvalue);
    } else if (subvalue === null || subvalue === undefined) {
      delete item[subkey];
    }
  });

  return item;
}

module.exports = {
  buildHistory,
  buildWorkflowExecutionRequest,
  momentToProtoTime,
  uiTransform,
  cliTransform,
};
