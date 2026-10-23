/* eslint-disable prettier/prettier */
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { RoomMessgesHelper } from "../helpers/roommessages.helper";

const SessionDescriptionSchema = z.object({
    type: z.enum(['offer', 'answer', 'pranswer', 'rollback']),
    sdp: z.string().optional(),
}, { message: RoomMessgesHelper.SIGNALING_NOT_VALID });

const to = z.string({ message: RoomMessgesHelper.SIGNALING_NOT_VALID }).min(1, RoomMessgesHelper.SIGNALING_NOT_VALID);

export const CallUserSchema = z.object({ to, offer: SessionDescriptionSchema });

export const MakeAnswerSchema = z.object({ to, answer: SessionDescriptionSchema });

export class CallUserDto extends createZodDto(CallUserSchema) { }

export class MakeAnswerDto extends createZodDto(MakeAnswerSchema) { }
