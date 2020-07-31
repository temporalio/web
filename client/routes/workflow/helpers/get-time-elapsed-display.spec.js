import moment from 'moment';
import getTimeElapsedDisplay from './get-time-elapsed-display';

describe('getTimeElapsedDisplay', () => {
  const DATE = '2020-01-01 00:00:00';
  const DATE_PLUS_ONE_HOUR = '2020-01-01 01:00:00';

  describe('When passed no timestamp', () => {
    it('should return "".', () => {
      const output = getTimeElapsedDisplay(null);

      expect(output).toEqual('');
    });
  });

  describe('When passed a timestamp and index = -1', () => {
    it('should return "".', () => {
      const ts = moment(DATE);
      const index = -1;
      const output = getTimeElapsedDisplay(ts, index);

      expect(output).toEqual('');
    });
  });

  describe('When passed a timestamp and index = 0', () => {
    it('should return the date string.', () => {
      const ts = moment(DATE);
      const index = 0;
      const output = getTimeElapsedDisplay(ts, index);

      expect(output).toEqual('Jan 1st 12:00:00 am');
    });
  });

  describe('When passed a timestamp and index = 1 and list of times', () => {
    it('should return the elapsed time between the first time and the second.', () => {
      const times = [moment(DATE), moment(DATE_PLUS_ONE_HOUR)];
      const index = 1;
      const output = getTimeElapsedDisplay(times[index], index, times);

      expect(output).toEqual('1h (+1h)');
    });
  });
});
