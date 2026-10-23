/* eslint-disable prettier/prettier */
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy.validate', () => {
  process.env.USER_JWT_SECRET_KEY = 'test-secret';
  const strategy = new JwtStrategy();

  it('aceita payload com exp', async () => {
    expect(await strategy.validate({ sub: 'user-1', email: 'a@b.com', exp: 1 })).toEqual({ userId: 'user-1', email: 'a@b.com' });
  });

  it('recusa payload sem exp (token antigo)', async () => {
    await expect(strategy.validate({ sub: 'user-1', email: 'a@b.com' })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
