import { getKeyValuePairs } from '~helpers';

const getEventDetails = event => {
  const { details, eventId, eventType, eventTimeDisplay } = event;
  const kvps = getKeyValuePairs({
    eventTime: eventTimeDisplay,
    eventId,
    ...details,
  });

  return {
    ...details,
    eventId,
    eventType,
    kvps,
    eventTime: eventTimeDisplay,
  };
};

export default getEventDetails;
