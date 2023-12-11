import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not } from 'typeorm';
import { TokenMarkets } from '../../../shared/entities/token-markets.entity';
import { TokenMarketsRepository } from '../repositories/token-markets.repository';

@Injectable()
@ValidatorConstraint({ name: 'isUnique', async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(TokenMarkets)
    private tokenMarketsRepository: TokenMarketsRepository,
  ) {}

  async validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const entity = args.object as any;
    const existingTokenMarkets = await this.tokenMarketsRepository.findOne({
      where: {
        [relatedPropertyName]: value,
        id: Not(Number(entity?.id) || 0),
      },
    });

    return !existingTokenMarkets;
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
