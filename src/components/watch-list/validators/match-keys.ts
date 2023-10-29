import { BadRequestException } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class MatchKeysConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (error) {
        throw new BadRequestException('Invalid JSON in settings.');
      }
    }

    const [objectToMatch] = args.constraints;

    return checkKeysInObjects(value, objectToMatch);
  }

  defaultMessage(args: ValidationArguments) {
    const [objectToMatch] = args.constraints;

    return `Setting does not match. Example: ${JSON.stringify(objectToMatch)}`;
  }
}

export function MatchKeys(
  objectToMatch: any,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'MatchKeys',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [objectToMatch],
      validator: MatchKeysConstraint,
    });
  };
}

function checkKeysInObjects(object, objectToMatch) {
  if (JSON.stringify(object) === JSON.stringify({})) {
    return false;
  }

  for (const key in object) {
    if (
      typeof object[key] === 'object' &&
      typeof objectToMatch[key] === 'object'
    ) {
      // If both values are objects, recursively check the keys
      if (!checkKeysInObjects(object[key], objectToMatch[key])) {
        return false; // Keys are not present at this level
      }
    } else if (!objectToMatch.hasOwnProperty(key)) {
      return false; // Key is not present
    }
  }
  return true;
}
