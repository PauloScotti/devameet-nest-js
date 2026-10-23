/* eslint-disable prettier/prettier */
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UserMessagesHelper } from '../helpers/user.helper';

export const RegisterSchema = z.object({
    name: z.string({ message: UserMessagesHelper.REGISTER_NAME_NOT_VALID }).min(2, UserMessagesHelper.REGISTER_NAME_NOT_VALID),
    email: z.string({ message: UserMessagesHelper.REGISTER_EMAIL_NOT_VALID }).email(UserMessagesHelper.REGISTER_EMAIL_NOT_VALID),
    password: z.string({ message: UserMessagesHelper.REGISTER_STRONG_PASSWORD })
        .min(4, UserMessagesHelper.REGISTER_STRONG_PASSWORD)
        .max(20, UserMessagesHelper.REGISTER_STRONG_PASSWORD)
        .regex(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, UserMessagesHelper.REGISTER_STRONG_PASSWORD),
    avatar: z.string(),
});

export class RegisterDto extends createZodDto(RegisterSchema) { }
