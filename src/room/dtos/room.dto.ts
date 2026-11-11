import { z } from 'zod';
import { gridPosition, objectId, orientation } from 'src/common/schemas';
import { RoomMessgesHelper } from '../helpers/roommessages.helper';

// Mensagens do WebSocket. O gateway valida cada uma antes de usar: o que chega
// pelo socket é entrada não confiável, igual ao corpo de uma requisição HTTP.
export const joinRoomSchema = z.object({
    userId: objectId,
    link: z
        .string(RoomMessgesHelper.JOIN_LINK_NOT_VALID)
        .min(1, RoomMessgesHelper.JOIN_LINK_NOT_VALID)
        .max(100, RoomMessgesHelper.JOIN_LINK_NOT_VALID),
});

export const updateUserPositionSchema = joinRoomSchema.extend({
    x: gridPosition,
    y: gridPosition,
    orientation,
});

export const toggleMuteSchema = joinRoomSchema.extend({
    muted: z.boolean(RoomMessgesHelper.MUTE_NOT_VALID),
});

// Negociação WebRTC: `to` é o id do socket de destino.
export const signalSchema = z.object({
    to: z.string().min(1).max(100),
    offer: z.unknown().optional(),
    answer: z.unknown().optional(),
});

export type JoinRoomDto = z.infer<typeof joinRoomSchema>;
export type UpdateUserPositionDto = z.infer<typeof updateUserPositionSchema>;
export type ToglMuteDto = z.infer<typeof toggleMuteSchema>;
