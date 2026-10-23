/* eslint-disable prettier/prettier */
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { MessagesHelper } from "../helpers/messages.helper";

export const LoginSchema = z.object({
    login: z.string({ message: MessagesHelper.AUTH_LOGIN_NOT_FOUND }).email(MessagesHelper.AUTH_LOGIN_NOT_FOUND),
    password: z.string({ message: MessagesHelper.AUTH_PASSWORD_NOT_FOUND }).min(1, MessagesHelper.AUTH_PASSWORD_NOT_FOUND),
});

export class LoginDto extends createZodDto(LoginSchema) { }
