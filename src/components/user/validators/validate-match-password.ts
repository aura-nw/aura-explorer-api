import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'matchPassword', async: false })
export class MatchPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `${relatedPropertyName} must be the same.`;
  }
}

export function MatchPassword(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'matchPassword',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: MatchPasswordConstraint,
    });
  };
}
