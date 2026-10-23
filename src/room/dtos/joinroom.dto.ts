/* eslint-disable prettier/prettier */
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { RoomMessgesHelper } from "../helpers/roommessages.helper";

export const JoinRoomSchema = z.object({
    link: z.string({ message: RoomMessgesHelper.JOIN_LINK_NOT_VALID }).min(1, RoomMessgesHelper.JOIN_LINK_NOT_VALID),
    video: z.boolean({ message: RoomMessgesHelper.VIDEO_NOT_VALID }).optional(),
});

export class JoinRoomDto extends createZodDto(JoinRoomSchema) { }
