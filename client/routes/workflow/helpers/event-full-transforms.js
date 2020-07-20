export const eventFullTransforms = {
  MarkerRecorded: (d) => {
    if (d.markerName === 'SideEffect') {
      return {
        data: d.details.data,
        workflowTaskCompletedEventId: d.workflowTaskCompletedEventId,
      };
    }

    return d;
  },
};
