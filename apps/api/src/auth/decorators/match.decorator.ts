import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * @Match(property) — Custom decorator untuk memvalidasi bahwa nilai
 * satu field cocok dengan nilai field lain di DTO yang sama.
 *
 * Penggunaan:
 * @Match('password', { message: 'Password tidak cocok' })
 * confirmPassword: string;
 *
 * Cara kerja:
 * class-validator meneruskan objek DTO lengkap ke ValidationArguments,
 * sehingga kita bisa membandingkan dua field secara langsung.
 *
 * Kenapa tidak pakai @IsEqual? → class-validator tidak menyediakan
 * decorator bawaan untuk cross-field comparison, jadi kita buat sendiri.
 */
export function Match(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: (object as { constructor: Function }).constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const relatedValue = (
            args.object as Record<string, unknown>
          )[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          return `${args.property} harus sama dengan ${relatedPropertyName}`;
        },
      },
    });
  };
}
