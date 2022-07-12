import * as moment from 'moment';

export function getCurrentDate(format?: string) {
  return moment().utc().format(format);
}
