/* eslint-disable prettier/prettier */
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { MeetMessagesHelper } from "src/meet/helpers/meetmessages.helper";

const coordinate = z.number({ message: MeetMessagesHelper.UPDATE_XY_NOT_VALID })
    .min(0, MeetMessagesHelper.UPDATE_XY_NOT_VALID)
    .max(8, MeetMessagesHelper.UPDATE_XY_NOT_VALID);

export const UpdateUserPositionSchema = z.object({
    x: coordinate,
    y: coordinate,
    orientation: z.string({ message: MeetMessagesHelper.UPDATE_ORIENTATION_NOT_VALID }),
});

export class UpdateUserPositionDto extends createZodDto(UpdateUserPositionSchema) { }
