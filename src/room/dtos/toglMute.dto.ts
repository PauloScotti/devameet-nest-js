/* eslint-disable prettier/prettier */
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { RoomMessgesHelper } from "../helpers/roommessages.helper";

export const ToglMuteSchema = z.object({
    muted: z.boolean({ message: RoomMessgesHelper.MUTE_NOT_VALID }),
});

export class ToglMuteDto extends createZodDto(ToglMuteSchema) { }
