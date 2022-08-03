import { ErrorMessages } from '@/common/error-messages';
import * as _ from 'class-validator';
export * from 'class-validator';

export function IsNumber(options?: _.ValidationOptions, context = '$property') {
  return _.IsNumber(undefined, { ...options, message: ErrorMessages.invalidFormat(context) });
}

export function IsString(options?: _.ValidationOptions, context = '$property') {
  return _.IsString({ ...options, message: ErrorMessages.invalidFormat(context) });
}

export function IsEmail(context = '$property') {
  return _.IsEmail(undefined, { message: ErrorMessages.invalidFormat(context) });
}

export function IsIn(values: readonly any[], context = '$property') {
  return _.IsIn(values, {
    message: ErrorMessages.invalidFormat(context),
  });
}

export function Length(min: number, max?: number, context = '$property') {
  return _.Length(min, max, {
    message: ErrorMessages.invalidLength(context),
  });
}

export function MaxLength(max: number, context = '$property') {
  return _.MaxLength(max, {
    message: ErrorMessages.invalidLength(context),
  });
}

export function ArrayMinSize(min: number, context = '$property') {
  return _.ArrayMinSize(min, {
    message: ErrorMessages.invalidFormat(context),
  });
}
