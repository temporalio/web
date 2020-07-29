export const eventFullTransforms = {
  MarkerRecorded: (d) => {
    if (d.markerName === 'SideEffect') {
      let event = {
        data: d.details.data,
        workflowTaskCompletedEventId: d.workflowTaskCompletedEventId,
      };
      if (d.details.sideEffectId) {
        event.sideEffectId = d.details.sideEffectId;
      }
      return event;
    }

    return d;
  },
};
