import getTimeElapsedDisplay from './get-time-elapsed-display';
import getTimeStampDisplay from './get-time-stamp-display';
import getEventDetails from './get-event-details';
import getEventFullDetails from './get-event-full-details';
import getEventSummary from './get-event-summary';
import { timestampToDate, getWorkflowInputDisplay } from '~helpers';

const getHistoryEvents = events => {
  if (!events) {
    return [];
  }

  return events
    .map(event => {
      const timestamp = timestampToDate(event.timestamp);

      return {
        ...event,
        timestamp,
      };
    })
    .map((event, index, eventList) => {
      const timeStampDisplay = getTimeStampDisplay(event);
      const timeElapsedDisplay = getTimeElapsedDisplay(event, index, eventList);

      return {
        ...event,
        timeStampDisplay,
        timeElapsedDisplay,
      };
    })
    .map(event => {
      if (event.details && event.details.input) {
        const input = getWorkflowInputDisplay(event.details.input);

        event.details.input = input;
      }

      return event;
    })
    .map(event => {
      const details = getEventDetails(event);
      const eventSummary = getEventSummary(event);
      const eventFullDetails = getEventFullDetails(event);

      return {
        ...event,
        details,
        eventSummary,
        eventFullDetails,
      };
    });
};

export default getHistoryEvents;
