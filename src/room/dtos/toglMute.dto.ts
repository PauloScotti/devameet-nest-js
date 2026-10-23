/* eslint-disable prettier/prettier */
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { JoinRoomSchema } from "./joinroom.dto";
import { RoomMessgesHelper } from "../helpers/roommessages.helper";

export const ToglMuteSchema = JoinRoomSchema.extend({
    muted: z.boolean({ message: RoomMessgesHelper.MUTE_NOT_VALID }),
});

export class ToglMuteDto extends createZodDto(ToglMuteSchema) { }
