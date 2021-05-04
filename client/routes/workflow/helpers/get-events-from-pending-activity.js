const getEventsFromPendingActivity = (activities, idOffset) => {
  if (!activities) {
    return [];
  }

  if (Number.isInteger(idOffset)) {
    idOffset = Number(idOffset);
  }

  return activities.map((a, i) => ({
    details: a,
    eventId: idOffset + i + 1,
    eventTime: a.scheduledTime,
    eventType: 'ActivityTaskStarted',
  }));
};

export default getEventsFromPendingActivity;
