import * as moment from 'moment';

export function getCurrentDateAS(format?: string) {
  return moment().utc().format(format);
}
