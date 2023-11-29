import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ChainInfo } from '../../../shared/entities/chain-info.entity';

@Injectable()
@ValidatorConstraint({ name: 'isUnique', async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(ChainInfo)
    private chainInfoRepository: Repository<ChainInfo>,
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
    const existingChainInfo = await this.chainInfoRepository.findOne({
      where: whereCondition,
    });

    return !existingChainInfo;
  }
}

export function IsUnique(
  properties: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isUnique',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [properties],
      options: validationOptions,
      validator: IsUniqueConstraint,
    });
  };
}
