"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match = Match;
const class_validator_1 = require("class-validator");
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
function Match(property, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'match',
            target: object.constructor,
            propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = args.object[relatedPropertyName];
                    return value === relatedValue;
                },
                defaultMessage(args) {
                    const [relatedPropertyName] = args.constraints;
                    return `${args.property} harus sama dengan ${relatedPropertyName}`;
                },
            },
        });
    };
}
//# sourceMappingURL=match.decorator.js.map