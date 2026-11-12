import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { gridPosition, orientation } from 'src/common/schemas';
import { MeetMessagesHelper } from '../helpers/meetmessages.helper';

export const createMeetSchema = z.object({
    name: z
        .string(MeetMessagesHelper.CREATE_NAME_NOT_VALID)
        .trim()
        .min(2, MeetMessagesHelper.CREATE_NAME_NOT_VALID)
        .max(100, MeetMessagesHelper.CREATE_NAME_NOT_VALID),
    color: z
        .string(MeetMessagesHelper.CREATE_COLOR_NOT_VALID)
        .regex(/^#?[0-9A-Fa-f]{3,8}$/, MeetMessagesHelper.CREATE_COLOR_NOT_VALID),
});

export class CreateMeetDto extends createZodDto(createMeetSchema) {}

export const meetObjectSchema = z.object({
    name: z
        .string(MeetMessagesHelper.UPDATE_OBJECT_NAME_NOT_VALID)
        .min(1, MeetMessagesHelper.UPDATE_OBJECT_NAME_NOT_VALID)
        .max(100, MeetMessagesHelper.UPDATE_OBJECT_NAME_NOT_VALID),
    x: gridPosition,
    y: gridPosition,
    zIndex: z.number(MeetMessagesHelper.UPDATE_ZINDEX_NOT_VALID).int(MeetMessagesHelper.UPDATE_ZINDEX_NOT_VALID),
    orientation: orientation.optional(),
});

// Uma sala tem 9x9 posições; o limite evita gravar listas enormes.
export const updateMeetSchema = createMeetSchema.extend({
    objects: z
        .array(meetObjectSchema, MeetMessagesHelper.UPDATE_OBJECT_NAME_NOT_VALID)
        .max(200, MeetMessagesHelper.UPDATE_OBJECT_NAME_NOT_VALID),
});

export class UpdateMeetDto extends createZodDto(updateMeetSchema) {}

export const meetResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    link: z.string(),
});

export class GetMeetDto extends createZodDto(meetResponseSchema) {}
