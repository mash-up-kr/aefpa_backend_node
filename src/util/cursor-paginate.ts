// from ... to string encoded value
export function encodeCursor(columnValue: string | Date | number) {
  const endcodeWithBase64 = (targetValue: string) =>
    Buffer.from(targetValue, 'utf8').toString('base64');

  let stringValue = '';

  if (typeof columnValue === 'string') {
    stringValue = columnValue;
  } else if (typeof columnValue === 'number') {
    stringValue = columnValue.toString();
  } else {
    // object
    if (columnValue instanceof Date) {
      stringValue = columnValue.getTime().toString();
    }
  }

  return endcodeWithBase64(stringValue);
}

type CursorType = 'Date' | 'string' | 'number';

// from string encoded value to decoded column value (ex) Date, string, number.. )
export function decodeCursor(cursorType: CursorType, encodedValue: string) {
  const decodeWithBase64 = (endcodedTargetValue: string) =>
    Buffer.from(endcodedTargetValue, 'base64').toString('utf8');

  const decodedValue = decodeWithBase64(encodedValue);

  if (cursorType === 'string') {
    return decodedValue;
  } else if (cursorType === 'number') {
    return +decodedValue;
  } else {
    // object
    if (cursorType === 'Date') {
      return new Date(+decodedValue);
    }
  }
}
