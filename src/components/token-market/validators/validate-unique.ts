import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { TokenMarketsRepository } from '../../cw20-token/repositories/token-markets.repository';

@Injectable()
@ValidatorConstraint({ name: 'isUnique', async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private tokenMarketsRepository: TokenMarketsRepository) {}

  async validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const entity = args.object as any;

    const existingUser = await this.tokenMarketsRepository.findOne({
      where: {
        [relatedPropertyName]: value,
        id: Not(Number(entity?.id) || 0),
      },
    });

    return !existingUser;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `${relatedPropertyName} must be unique.`;
  }
}

export function IsUnique(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isUnique',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsUniqueConstraint,
    });
  };
}
