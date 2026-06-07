import { IsEmail, IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'peter@emeraldkingdom.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'P@ssw0rd!2024' })
  @IsString()
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MaxLength(72)
  password!: string;
}
