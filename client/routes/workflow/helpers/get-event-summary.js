import { extractEventSummary } from './summarize-events';
import { getKeyValuePairs } from '~helpers';

const getEventSummary = event => {
  if (!event) {
    return event;
  }

  if (!event.details) {
    return event.details;
  }

  const { eventId, eventType, details } = event;

  const summary = extractEventSummary(eventType, details);
  const kvps = getKeyValuePairs(summary);

  return {
    ...summary,
    eventId,
    eventType,
    kvps,
  };
};

export default getEventSummary;
