/* eslint-disable prettier/prettier */
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { RoomMessgesHelper } from "../helpers/roommessages.helper";

export const ToglVideoSchema = z.object({
    video: z.boolean({ message: RoomMessgesHelper.VIDEO_NOT_VALID }),
});

export class ToglVideoDto extends createZodDto(ToglVideoSchema) { }
