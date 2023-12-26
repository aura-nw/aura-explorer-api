import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenMarkets } from '../../../shared/entities/token-markets.entity';
import { TokenMarketsRepository } from '../repositories/token-markets.repository';
import { Not } from 'typeorm';

@Injectable()
@ValidatorConstraint({ name: 'isUniqueManyColumn', async: true })
export class IsUniqueManyColumnConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @InjectRepository(TokenMarkets)
    private tokenMarketsRepository: TokenMarketsRepository,
  ) {}

  async validate(value: any, args: ValidationArguments) {
    const entity = args.object as any;
    const propertiesName = args.constraints[0];

    const whereCondition = propertiesName.reduce(
      (where, propertyName) => {
        where[propertyName] = args.object[propertyName];
        return where;
      },
      { id: Not(Number(entity?.id) || 0) },
    );

    const existingTokenMarkets = await this.tokenMarketsRepository.findOne({
      where: whereCondition,
    });

    return !existingTokenMarkets;
  }
}

export function IsUniqueManyColumn(
  property: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isUnique',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsUniqueManyColumnConstraint,
    });
  };
}
