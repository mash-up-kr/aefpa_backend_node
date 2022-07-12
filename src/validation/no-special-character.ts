import { ErrorMessages } from '@/common/error-messages';
import { registerDecorator, ValidationOptions } from 'class-validator';

const specialCharacterRegex = /[~`!@#$%\^&*\(\)_+\-=\[\]{};':"\\|,.<>\/?]/;

export function NoSpecialCharacter(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'NoSpecialCharacter',
      target: object.constructor,
      propertyName,
      options: options,
      constraints: [],
      validator: {
        validate(text: string) {
          return !specialCharacterRegex.test(text);
        },
        defaultMessage() {
          return ErrorMessages.invalidFormat();
        },
      },
    });
  };
}
