/* eslint-disable prettier/prettier */
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { MeetMessagesHelper } from "../helpers/meetmessages.helper";

export const CreateMeetSchema = z.object({
    name: z.string({ message: MeetMessagesHelper.CREATE_NAME_NOT_VALID }).min(2, MeetMessagesHelper.CREATE_NAME_NOT_VALID),
    color: z.string({ message: MeetMessagesHelper.CREATE_COLOR_NOT_VALID }).regex(/[0-9A-Fa-f]{3,6}/, MeetMessagesHelper.CREATE_COLOR_NOT_VALID),
});

export class CreateMeetDto extends createZodDto(CreateMeetSchema) { }
