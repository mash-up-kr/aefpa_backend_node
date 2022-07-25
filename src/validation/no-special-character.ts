import { ErrorMessages } from '@/common/error-messages';
import { registerDecorator } from '@/validation';

const specialCharacterRegex = /[~`!@#$%\^&*\(\)_+\-=\[\]{};':"\\|,.<>\/?]/;

export function NoSpecialCharacter(context?: string) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'NoSpecialCharacter',
      target: object.constructor,
      propertyName,
      constraints: [],
      validator: {
        validate(text: string) {
          return !specialCharacterRegex.test(text);
        },
        defaultMessage() {
          return ErrorMessages.invalidFormat(context);
        },
      },
    });
  };
}
