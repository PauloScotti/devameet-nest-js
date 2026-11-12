import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UserMessagesHelper } from '../helpers/user.helper';

const name = z
    .string(UserMessagesHelper.REGISTER_NAME_NOT_VALID)
    .trim()
    .min(2, UserMessagesHelper.REGISTER_NAME_NOT_VALID)
    .max(100, UserMessagesHelper.REGISTER_NAME_NOT_VALID);

const avatar = z.string('Avatar não é válido').min(1, 'Avatar não é válido').max(100, 'Avatar não é válido');

// Maiúscula, minúscula e pelo menos um número ou símbolo.
const STRONG_PASSWORD = /^(?=.*[A-Z])(?=.*[a-z])(?=.*(\d|\W)).+$/;

export const registerSchema = z.object({
    name,
    email: z.email(UserMessagesHelper.REGISTER_EMAIL_NOT_VALID).max(254, UserMessagesHelper.REGISTER_EMAIL_NOT_VALID),
    password: z
        .string(UserMessagesHelper.REGISTER_STRONG_PASSWORD)
        .min(8, UserMessagesHelper.REGISTER_STRONG_PASSWORD)
        .max(128, UserMessagesHelper.REGISTER_STRONG_PASSWORD)
        .regex(STRONG_PASSWORD, UserMessagesHelper.REGISTER_STRONG_PASSWORD),
    avatar,
});

export class RegisterDto extends createZodDto(registerSchema) {}

export const updateUserSchema = z.object({ name, avatar });

export class UpdateUserDto extends createZodDto(updateUserSchema) {}

export const userResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string(),
});

export class UserResponseDto extends createZodDto(userResponseSchema) {}
