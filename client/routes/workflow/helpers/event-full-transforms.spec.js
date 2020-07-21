import { eventFullTransforms } from './event-full-transforms';

describe('eventFullTransforms', () => {
  describe('MarkerRecorded', () => {
    describe('When passed event.markerName === "SideEffect"', () => {
      let event;

      beforeEach(() => {
        event = {
          workflowTaskCompletedEventId: 'workflowTaskCompletedEventIdValue',
          details: {
            data: { payloads: ['hello', 'world'] },
            sideEffectId: 'sideEffectIdValue',
          },
          markerName: 'SideEffect',
        };
      });

      it('should return an object with property sideEffectId.', () => {
        const output = eventFullTransforms.MarkerRecorded(event);

        expect(output.sideEffectId).toEqual('sideEffectIdValue');
      });

      it('should return an object with property data.', () => {
        const output = eventFullTransforms.MarkerRecorded(event);

        expect(output.data).toEqual({ payloads: ['hello', 'world'] });
      });

      it('should return an object with property workflowTaskCompletedEventId.', () => {
        const output = eventFullTransforms.MarkerRecorded(event);

        expect(output.workflowTaskCompletedEventId).toEqual(
          'workflowTaskCompletedEventIdValue'
        );
      });
    });
  });

  describe('When passed event.markerName !== "SideEffect"', () => {
    let event;

    beforeEach(() => {
      event = {
        workflowTaskCompletedEventId: 'workflowTaskCompletedEventIdValue',
        details: [
          'sideEffectIdValue',
          'eyAiaGVsbG8iOiAid29ybGQiIH0', // { "hello": "world" }
        ],
        markerName: 'NotSideEffect',
      };
    });

    it('should return original event object.', () => {
      const output = eventFullTransforms.MarkerRecorded(event);

      expect(output).toEqual(event);
    });
  });
});
