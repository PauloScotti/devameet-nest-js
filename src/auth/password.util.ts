import * as argon2 from 'argon2';
import * as CryptoJS from 'crypto-js';
import { createHash, timingSafeEqual } from 'crypto';

export function hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
}

export type PasswordCheck = { valid: boolean; needsRehash: boolean };

// As contas antigas guardam a senha cifrada com AES reversível. Elas continuam
// entrando (enquanto USER_CYPHER_SECRET_KEY estiver definida), e quem chama
// regrava com argon2 quando `needsRehash` vem verdadeiro.
export async function verifyPassword(password: string, stored: string): Promise<PasswordCheck> {
    if (stored.startsWith('$argon2')) {
        try {
            const valid = await argon2.verify(stored, password);
            return { valid, needsRehash: valid && argon2.needsRehash(stored) };
        } catch {
            return { valid: false, needsRehash: false };
        }
    }

    const legacy = decryptLegacy(stored);
    const valid = legacy !== null && safeEqual(password, legacy);
    return { valid, needsRehash: valid };
}

function decryptLegacy(stored: string): string | null {
    const secret = process.env.USER_CYPHER_SECRET_KEY;
    if (!secret) {
        return null;
    }
    try {
        const plain = CryptoJS.AES.decrypt(stored, secret).toString(CryptoJS.enc.Utf8);
        return plain === '' ? null : plain;
    } catch {
        return null;
    }
}

function safeEqual(a: string, b: string): boolean {
    const digest = (value: string) => createHash('sha256').update(value).digest();
    return timingSafeEqual(digest(a), digest(b));
}
