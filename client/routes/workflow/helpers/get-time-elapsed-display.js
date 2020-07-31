import moment from 'moment';

const getTimeElapsedDisplay = (timestamp, index, timestamps) => {
  if (!timestamp || index === -1) {
    return '';
  }

  if (index === 0) {
    return timestamp.format('MMM Do h:mm:ss a');
  }

  const deltaFromPrev = moment.duration(timestamp - timestamps[index - 1]);
  let elapsed = moment.duration(timestamp - timestamps[0]).format();

  if (deltaFromPrev.asSeconds() >= 1) {
    elapsed += ` (+${deltaFromPrev.format()})`;
  }

  return elapsed;
};

export default getTimeElapsedDisplay;
