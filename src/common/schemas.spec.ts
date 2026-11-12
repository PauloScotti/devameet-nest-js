import { loginSchema } from 'src/auth/dtos/login.dto';
import { createMeetSchema, updateMeetSchema } from 'src/meet/dtos/createmeet.dto';
import { joinRoomSchema, signalSchema, toggleMuteSchema, updateUserPositionSchema } from 'src/room/dtos/room.dto';
import { registerSchema, updateUserSchema } from 'src/user/dtos/register.dto';
import { idParamSchema } from './schemas';

const ok =
    (schema: { safeParse: (v: unknown) => { success: boolean } }) =>
    (value: unknown) =>
        schema.safeParse(value).success;

const ID = '65a1f0c2e4b0a1b2c3d4e5f6';
const user = { name: 'Ana', email: 'ana@x.com', password: 'Senha@12345', avatar: 'avatar_01' };

describe('schemas de usuário', () => {
    it('cadastro descarta campos desconhecidos', () => {
        expect(registerSchema.parse({ ...user, _id: 'x', admin: true })).toEqual(user);
    });

    it('senha precisa de 8 caracteres, maiúscula, minúscula e número ou símbolo', () => {
        for (const password of ['Abc1', 'senha@12345', 'SENHA@12345', 'SenhaSemNumero']) {
            expect(ok(registerSchema)({ ...user, password })).toBe(false);
        }
        expect(ok(registerSchema)({ ...user, password: 'SenhaComSimbolo!' })).toBe(true);
    });

    it('login aceita senha antiga fora da regra e rejeita operador do MongoDB', () => {
        expect(ok(loginSchema)({ login: 'ana@x.com', password: 'abc' })).toBe(true);
        expect(ok(loginSchema)({ login: { $ne: null }, password: 'x' })).toBe(false);
        expect(ok(loginSchema)({ login: 'ana@x.com', password: { $ne: null } })).toBe(false);
    });

    it('atualização só aceita nome e avatar', () => {
        expect(updateUserSchema.parse({ name: 'Ana', avatar: 'avatar_02', password: 'x', email: 'y@z.com' })).toEqual({
            name: 'Ana',
            avatar: 'avatar_02',
        });
    });
});

describe('schemas de reunião', () => {
    const object = { name: 'wall_01', x: 1, y: 2, zIndex: 1, orientation: 'front' };

    it('cor precisa ser hexadecimal, com ou sem #', () => {
        expect(ok(createMeetSchema)({ name: 'Daily', color: '#ff00aa' })).toBe(true);
        expect(ok(createMeetSchema)({ name: 'Daily', color: 'fff' })).toBe(true);
        expect(ok(createMeetSchema)({ name: 'Daily', color: 'vermelho' })).toBe(false);
        expect(ok(createMeetSchema)({ name: 'Daily', color: '#fff; drop' })).toBe(false);
    });

    it('objeto fica dentro da grade de 0 a 8 e perde campos extras', () => {
        const parsed = updateMeetSchema.parse({
            name: 'Daily',
            color: '#fff',
            objects: [{ ...object, type: 'wall', _id: 'x' }],
        });

        expect(parsed.objects[0]).toEqual(object);
        expect(ok(updateMeetSchema)({ name: 'Daily', color: '#fff', objects: [{ ...object, x: 9 }] })).toBe(false);
        expect(ok(updateMeetSchema)({ name: 'Daily', color: '#fff', objects: [{ ...object, y: -1 }] })).toBe(false);
    });

    it('id da URL precisa ser um ObjectId', () => {
        expect(ok(idParamSchema)({ id: ID })).toBe(true);
        expect(ok(idParamSchema)({ id: 'abc' })).toBe(false);
        expect(ok(idParamSchema)({ id: { $ne: null } })).toBe(false);
    });
});

describe('mensagens do WebSocket', () => {
    const join = { link: 'abc-1234-xyz', userId: ID };

    it('entrada na sala exige link e id de usuário válidos', () => {
        expect(ok(joinRoomSchema)(join)).toBe(true);
        expect(ok(joinRoomSchema)({ ...join, userId: { $ne: null } })).toBe(false);
        expect(ok(joinRoomSchema)({ userId: ID })).toBe(false);
        expect(ok(joinRoomSchema)(undefined)).toBe(false);
    });

    it('movimento fica dentro da grade', () => {
        expect(ok(updateUserPositionSchema)({ ...join, x: 3, y: 4, orientation: 'left' })).toBe(true);
        expect(ok(updateUserPositionSchema)({ ...join, x: 99, y: 4, orientation: 'left' })).toBe(false);
        expect(ok(updateUserPositionSchema)({ ...join, x: '3', y: 4, orientation: 'left' })).toBe(false);
    });

    it('mudo precisa ser booleano e a sinalização precisa de destino', () => {
        expect(ok(toggleMuteSchema)({ ...join, muted: true })).toBe(true);
        expect(ok(toggleMuteSchema)({ ...join, muted: 'sim' })).toBe(false);
        expect(ok(signalSchema)({ to: 'socket-id', offer: { sdp: 'x' } })).toBe(true);
        expect(ok(signalSchema)({ offer: { sdp: 'x' } })).toBe(false);
    });
});
