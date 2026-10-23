/* eslint-disable prettier/prettier */
export const JWT_DEFAULT_EXPIRES_IN = '8h';

export const getJwtExpiresIn = () => process.env.USER_JWT_EXPIRES_IN || JWT_DEFAULT_EXPIRES_IN;

// Tokens emitidos antes da expiração existir não têm "exp" e nunca venceriam: são recusados.
export const hasExpiration = (payload: any) => typeof payload?.exp === 'number';
