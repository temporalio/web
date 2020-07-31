import getTimeElapsedDisplay from './get-time-elapsed-display';
import getTimeStampDisplay from './get-time-stamp-display';
import getEventDetails from './get-event-details';
import getEventFullDetails from './get-event-full-details';
import getEventSummary from './get-event-summary';
import { timestampToDate } from '~helpers';

const getHistoryEvents = (events) => {
  if (!events) {
    return [];
  }

  return events
    .map((event) => {
      const eventTime = timestampToDate(event.eventTime);

      return {
        ...event,
        eventTime,
      };
    })
    .map((event, index, eventList) => {
      const eventTimeDisplay = getTimeStampDisplay(event.eventTime);
      const eventTimes = eventList.map((a) => a.eventTime);
      const timeElapsedDisplay = getTimeElapsedDisplay(
        event.eventTime,
        index,
        eventTimes
      );

      return {
        ...event,
        eventTimeDisplay,
        timeElapsedDisplay,
      };
    })
    .map((event) => {
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
