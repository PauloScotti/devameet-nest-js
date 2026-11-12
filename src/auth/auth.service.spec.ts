import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as CryptoJS from 'crypto-js';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { hashPassword } from './password.util';

describe('AuthService', () => {
    const userService = {
        getUserByEmail: jest.fn(),
        setPassword: jest.fn(),
        existsByEmail: jest.fn(),
        create: jest.fn(),
    };
    const jwtService = { sign: jest.fn().mockReturnValue('token-assinado') };
    const service = new AuthService(userService as unknown as UserService, jwtService as unknown as JwtService);

    const userWith = (password: string) => ({ _id: 'id-1', email: 'ana@x.com', name: 'Ana', password });
    const credentials = (password: string) => ({ login: 'ana@x.com', password });

    beforeEach(() => {
        jest.clearAllMocks();
        jwtService.sign.mockReturnValue('token-assinado');
        process.env.USER_CYPHER_SECRET_KEY = 'cifra-de-teste';
    });

    it('login devolve token e nunca a senha', async () => {
        userService.getUserByEmail.mockResolvedValue(userWith(await hashPassword('Senha@12345')));

        const result = await service.login(credentials('Senha@12345'));

        expect(result).toEqual({ email: 'ana@x.com', name: 'Ana', token: 'token-assinado' });
        expect(jwtService.sign).toHaveBeenCalledWith({ email: 'ana@x.com', sub: 'id-1' });
        expect(userService.setPassword).not.toHaveBeenCalled();
    });

    it('senha errada e e-mail inexistente recebem a mesma resposta', async () => {
        userService.getUserByEmail.mockResolvedValue(userWith(await hashPassword('Senha@12345')));
        const wrongPassword = await service.login(credentials('errada')).catch((e) => e);

        userService.getUserByEmail.mockResolvedValue(null);
        const unknownEmail = await service.login(credentials('Senha@12345')).catch((e) => e);

        expect(wrongPassword).toBeInstanceOf(BadRequestException);
        expect(wrongPassword.message).toBe(unknownEmail.message);
        expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('conta antiga em AES entra e tem a senha regravada com hash', async () => {
        userService.getUserByEmail.mockResolvedValue(
            userWith(CryptoJS.AES.encrypt('Antiga1', 'cifra-de-teste').toString()),
        );

        await service.login(credentials('Antiga1'));

        expect(userService.setPassword).toHaveBeenCalledWith('id-1', 'Antiga1');
    });

    it('cadastro rejeita e-mail já usado', async () => {
        userService.existsByEmail.mockResolvedValue(true);

        await expect(
            service.register({ name: 'Ana', email: 'ana@x.com', password: 'Senha@12345', avatar: 'avatar_01' }),
        ).rejects.toThrow(BadRequestException);
        expect(userService.create).not.toHaveBeenCalled();
    });
});
