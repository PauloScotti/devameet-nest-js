import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { MessagesHelper } from '../helpers/messages.helper';

// Sem regra de força de senha: contas antigas têm senhas fora da regra atual.
export const loginSchema = z.object({
    login: z.email(MessagesHelper.AUTH_LOGIN_NOT_FOUND).max(254, MessagesHelper.AUTH_LOGIN_NOT_FOUND),
    password: z
        .string(MessagesHelper.AUTH_PASSWORD_NOT_FOUND)
        .min(1, MessagesHelper.AUTH_PASSWORD_NOT_FOUND)
        .max(128, MessagesHelper.AUTH_PASSWORD_NOT_FOUND),
});

export class LoginDto extends createZodDto(loginSchema) {}

export const loginResponseSchema = z.object({
    email: z.string(),
    name: z.string(),
    token: z.string(),
});

export class LoginResponseDto extends createZodDto(loginResponseSchema) {}
