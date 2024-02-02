import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AURA_INFO } from '../../../shared/constants/common';
import { isValidBench32Address } from '../../../shared/utils/service.util';

@Injectable()
@ValidatorConstraint({ name: 'isValidBench32Address', async: true })
export class IsValidBech32AddressConstraint
  implements ValidatorConstraintInterface
{
  async validate(value: string): Promise<boolean> {
    return isValidBench32Address(value);
  }

  defaultMessage() {
    return `Invalid ${AURA_INFO.ADDRESS_PREFIX} address format.`;
  }
}

export function IsValidBench32Address(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidBench32Address',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsValidBech32AddressConstraint,
    });
  };
}
