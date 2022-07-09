export const ErrorMessages = {
  invalidFormat(allowingValues?: any) {
    return allowingValues
      ? `Invalid Format${allowingValues ? ` - allowing values: [${allowingValues}]` : ''}`
      : 'Invalid Format';
  },
  alreadyExists: 'Already Exists',
  notFound: 'Not Found',
};
