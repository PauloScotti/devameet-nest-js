/* eslint-disable prettier/prettier */
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { CreateMeetSchema } from "./createmeet.dto";
import { MeetMessagesHelper } from "../helpers/meetmessages.helper";

const coordinate = z.number({ message: MeetMessagesHelper.UPDATE_XY_NOT_VALID })
    .min(0, MeetMessagesHelper.UPDATE_XY_NOT_VALID)
    .max(8, MeetMessagesHelper.UPDATE_XY_NOT_VALID);

export const UpdateMeetObjectSchema = z.object({
    name: z.string({ message: MeetMessagesHelper.UPDATE_OBJECT_NAME_NOT_VALID }).min(1, MeetMessagesHelper.UPDATE_OBJECT_NAME_NOT_VALID),
    x: coordinate,
    y: coordinate,
    zIndex: z.number({ message: MeetMessagesHelper.UPDATE_ZINDEX_NOT_VALID }),
    orientation: z.string({ message: MeetMessagesHelper.UPDATE_ORIENTATION_NOT_VALID }),
});

export const UpdateMeetSchema = CreateMeetSchema.extend({
    objects: z.array(UpdateMeetObjectSchema, { message: MeetMessagesHelper.UPDATE_OBJECT_NAME_NOT_VALID }),
});

export class UpdateMeetObjectDto extends createZodDto(UpdateMeetObjectSchema) { }

export class UpdateMeetDto extends createZodDto(UpdateMeetSchema) { }
