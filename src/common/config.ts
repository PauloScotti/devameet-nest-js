const MIN_JWT_SECRET_LENGTH = 32;

// A aplicação não sobe sem a chave do JWT: a falha aparece na inicialização,
// não na primeira requisição.
export function jwtSecret(): string {
    const secret = process.env.USER_JWT_SECRET_KEY;
    if (!secret || secret.length < MIN_JWT_SECRET_LENGTH) {
        throw new Error(
            `Defina USER_JWT_SECRET_KEY com pelo menos ${MIN_JWT_SECRET_LENGTH} caracteres.`,
        );
    }
    return secret;
}

export const JWT_EXPIRES_IN = '7d';
