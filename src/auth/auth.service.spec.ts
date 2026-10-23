/* eslint-disable prettier/prettier */
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

describe('AuthService.login', () => {
  const jwtService = new JwtService({});
  const user = { _id: 'user-1', email: 'a@b.com', name: 'Ana' };
  const userService = { getUserByLoginPassword: jest.fn().mockResolvedValue(user) } as unknown as UserService;
  const service = new AuthService(userService, jwtService);

  beforeAll(() => { process.env.USER_JWT_SECRET_KEY = 'test-secret'; });
  afterEach(() => { delete process.env.USER_JWT_EXPIRES_IN; });

  const tokenLifetime = async () => {
    const { token } = await service.login({ login: user.email, password: 'x' });
    const { iat, exp } = jwtService.decode(token) as any;
    return exp - iat;
  };

  it('emite token com validade padrão de 8h', async () => {
    expect(await tokenLifetime()).toBe(8 * 60 * 60);
  });

  it('respeita USER_JWT_EXPIRES_IN', async () => {
    process.env.USER_JWT_EXPIRES_IN = '30m';
    expect(await tokenLifetime()).toBe(30 * 60);
  });
});
