import moment from 'moment';

const timestampToDate = (timestamp) => {
  if (!timestamp) {
    return timestamp;
  }

  let ts = 0;

  if (typeof timestamp === 'number') {
    ts = timestamp;
  } else if (typeof timestamp === 'string') {
    return moment(timestamp);
  } else if (typeof timestamp === 'object') {
    if (typeof timestamp.value === 'string') {
      ts = parseInt(timestamp.value);
    }
  } else {
    throw Error(`timestamp value type is not recognized: ${typeof timestamp} `);
  }

  ts = ts / 1000000;
  return moment(ts);
};

export default timestampToDate;
