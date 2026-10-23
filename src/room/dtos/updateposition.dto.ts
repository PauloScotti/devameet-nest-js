/* eslint-disable prettier/prettier */
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { JoinRoomSchema } from "./joinroom.dto";
import { MeetMessagesHelper } from "src/meet/helpers/meetmessages.helper";

const coordinate = z.number({ message: MeetMessagesHelper.UPDATE_XY_NOT_VALID })
    .min(0, MeetMessagesHelper.UPDATE_XY_NOT_VALID)
    .max(8, MeetMessagesHelper.UPDATE_XY_NOT_VALID);

export const UpdateUserPositionSchema = JoinRoomSchema.extend({
    x: coordinate,
    y: coordinate,
    orientation: z.string({ message: MeetMessagesHelper.UPDATE_ORIENTATION_NOT_VALID }),
});

export class UpdateUserPositionDto extends createZodDto(UpdateUserPositionSchema) { }
