import * as CryptoJS from 'crypto-js';
import { hashPassword, verifyPassword } from './password.util';

describe('password.util', () => {
    const legacySecret = 'cifra-de-teste';
    const legacy = (password: string) => CryptoJS.AES.encrypt(password, legacySecret).toString();

    beforeEach(() => {
        process.env.USER_CYPHER_SECRET_KEY = legacySecret;
    });

    it('gera hash argon2id, diferente a cada chamada', async () => {
        const first = await hashPassword('Senha@12345');
        const second = await hashPassword('Senha@12345');

        expect(first).toMatch(/^\$argon2id\$/);
        expect(first).not.toBe(second);
    });

    it('confere a senha certa e rejeita a errada', async () => {
        const stored = await hashPassword('Senha@12345');

        await expect(verifyPassword('Senha@12345', stored)).resolves.toEqual({ valid: true, needsRehash: false });
        await expect(verifyPassword('errada', stored)).resolves.toEqual({ valid: false, needsRehash: false });
    });

    it('senha antiga em AES entra e pede para regravar', async () => {
        await expect(verifyPassword('Antiga1', legacy('Antiga1'))).resolves.toEqual({ valid: true, needsRehash: true });
        await expect(verifyPassword('errada', legacy('Antiga1'))).resolves.toEqual({ valid: false, needsRehash: false });
    });

    it('sem a chave antiga configurada, senha em AES não entra', async () => {
        const stored = legacy('Antiga1');
        delete process.env.USER_CYPHER_SECRET_KEY;

        await expect(verifyPassword('Antiga1', stored)).resolves.toEqual({ valid: false, needsRehash: false });
    });

    it('valor armazenado malformado não estoura', async () => {
        await expect(verifyPassword('x', '$argon2id$lixo')).resolves.toEqual({ valid: false, needsRehash: false });
        await expect(verifyPassword('x', 'texto-qualquer')).resolves.toEqual({ valid: false, needsRehash: false });
    });
});
