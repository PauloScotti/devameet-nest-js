/* eslint-disable prettier/prettier */
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UserMessagesHelper } from '../helpers/user.helper';

export const UpdateUserSchema = z.object({
    name: z.string({ message: UserMessagesHelper.REGISTER_NAME_NOT_VALID }).min(2, UserMessagesHelper.REGISTER_NAME_NOT_VALID),
    avatar: z.string(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) { }
