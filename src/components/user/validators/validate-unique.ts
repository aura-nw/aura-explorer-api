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
import { User } from '../../../shared/entities/user.entity';

@Injectable()
@ValidatorConstraint({ name: 'isUnique', async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const entity = args.object as any;

    const existingUser = await this.userRepository.findOne({
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
