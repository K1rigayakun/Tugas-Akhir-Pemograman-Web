import { ValidationOptions } from 'class-validator';
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
export declare function Match(property: string, validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
//# sourceMappingURL=match.decorator.d.ts.map