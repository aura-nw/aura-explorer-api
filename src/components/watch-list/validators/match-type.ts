import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {
  AURA_INFO,
  LENGTH,
  NAME_TAG_TYPE,
} from '../../../shared/constants/common';

@ValidatorConstraint({ name: 'matchType', async: false })
export class MatchTypeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];

    if (!relatedValue || !value) return true;

    const matchAccount =
      relatedValue.length === LENGTH.ACCOUNT_ADDRESS &&
      value === NAME_TAG_TYPE.ACCOUNT;
    const matchContract =
      relatedValue.length === LENGTH.CONTRACT_ADDRESS &&
      value === NAME_TAG_TYPE.CONTRACT;

    return matchAccount || matchContract;
  }

  defaultMessage() {
    return `Invalid ${AURA_INFO.ADDRESS_PREFIX} address format.`;
  }
}

export function MatchType(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'matchType',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: MatchTypeConstraint,
    });
  };
}
