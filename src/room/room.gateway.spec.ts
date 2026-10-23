/* eslint-disable prettier/prettier */
import { JwtService } from '@nestjs/jwt';
import { RoomGateway } from './room.gateway';
import { RoomService } from './room.service';
import { RoomMessgesHelper } from './helpers/roommessages.helper';

describe('RoomGateway', () => {
  const secret = 'test-secret';
  const users = [{ clientId: 'socket-1' }];
  const jwtService = new JwtService({});
  let service: jest.Mocked<Pick<RoomService, 'updateUserVideo' | 'updateUserMute' | 'listUsersPositionByLink' | 'updateUserPosition'>>;
  let gateway: RoomGateway;
  let roomEmit: jest.Mock;

  const client = (id: string, userId?: string) => {
    const toEmit = jest.fn();
    return {
      id,
      data: { userId },
      handshake: { auth: {} },
      join: jest.fn(),
      to: jest.fn().mockReturnValue({ emit: toEmit }),
      toEmit,
    } as any;
  };

  beforeAll(() => { process.env.USER_JWT_SECRET_KEY = secret; });

  beforeEach(async () => {
    service = {
      updateUserVideo: jest.fn(),
      updateUserMute: jest.fn(),
      listUsersPositionByLink: jest.fn().mockResolvedValue(users),
      updateUserPosition: jest.fn(),
    };
    gateway = new RoomGateway(service as unknown as RoomService, jwtService);
    roomEmit = jest.fn();
    gateway.wss = { to: jest.fn().mockReturnValue({ emit: roomEmit }) } as any;
  });

  describe('authenticate', () => {
    it('aceita token válido e guarda o userId do token', () => {
      const socket = client('socket-1');
      socket.handshake.auth.token = jwtService.sign({ sub: 'user-1' }, { secret, expiresIn: '1h' });
      const next = jest.fn();

      gateway.authenticate(socket, next);

      expect(next).toHaveBeenCalledWith();
      expect(socket.data.userId).toBe('user-1');
    });

    it.each([
      ['ausente', undefined],
      ['malformado', 'invalido'],
      ['de outra chave', new JwtService({}).sign({ sub: 'user-1' }, { secret: 'outro', expiresIn: '1h' })],
      ['sem expiração', new JwtService({}).sign({ sub: 'user-1' }, { secret })],
      ['expirado', new JwtService({}).sign({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) - 10 }, { secret })],
    ])('recusa token %s', (_, token) => {
      const socket = client('socket-1');
      socket.handshake.auth.token = token;
      const next = jest.fn();

      gateway.authenticate(socket, next);

      expect(next.mock.calls[0][0]).toEqual(new Error(RoomMessgesHelper.SOCKET_UNAUTHORIZED));
      expect(socket.data.userId).toBeUndefined();
    });
  });

  describe('com usuário na sala', () => {
    const joined = client('socket-1', 'user-1');

    beforeEach(async () => {
      await gateway.handleJoin(joined, { link: 'room-1', video: false });
      roomEmit.mockClear();
    });

    it('join usa o userId do token, entra na sala do socket.io e emite só para a sala', () => {
      expect(service.updateUserPosition).toHaveBeenCalledWith('socket-1', expect.objectContaining({ link: 'room-1', userId: 'user-1', video: false }));
      expect(joined.join).toHaveBeenCalledWith('room-1');
      expect(gateway.wss.to).toHaveBeenCalledWith('room-1');
    });

    it('move usa sala e usuário do socket', async () => {
      await gateway.handleMovement(joined, { x: 1, y: 2, orientation: 'front' });

      expect(service.updateUserPosition).toHaveBeenLastCalledWith('socket-1', { x: 1, y: 2, orientation: 'front', link: 'room-1', userId: 'user-1' });
      expect(roomEmit).toHaveBeenCalledWith('room-1-update-user-list', { users });
    });

    it('mute e vídeo usam sala e usuário do socket', async () => {
      await gateway.handleToglMute(joined, { muted: true });
      await gateway.handleToglVideo(joined, { video: true });

      expect(service.updateUserMute).toHaveBeenCalledWith('room-1', 'user-1', { muted: true });
      expect(service.updateUserVideo).toHaveBeenCalledWith('room-1', 'user-1', { video: true });
    });

    it('sinalização só é repassada para socket da mesma sala', async () => {
      const other = client('socket-2', 'user-2');
      await gateway.handleJoin(other, { link: 'room-2' });
      const offer = { type: 'offer' as const, sdp: 'v=0' };

      await gateway.callUser(joined, { to: 'socket-2', offer });
      expect(joined.to).not.toHaveBeenCalledWith('socket-2');

      const sameRoom = client('socket-3', 'user-3');
      await gateway.handleJoin(sameRoom, { link: 'room-1' });
      await gateway.callUser(joined, { to: 'socket-3', offer });
      expect(joined.to).toHaveBeenCalledWith('socket-3');
      expect(joined.toEmit).toHaveBeenCalledWith('call-made', { offer, socket: 'socket-1' });
    });
  });

  it('ignora eventos de sockets que não entraram em uma sala', async () => {
    const socket = client('socket-9', 'user-9');

    await gateway.handleMovement(socket, { x: 1, y: 1, orientation: 'front' });
    await gateway.handleToglMute(socket, { muted: true });
    await gateway.handleToglVideo(socket, { video: true });

    expect(service.updateUserPosition).not.toHaveBeenCalled();
    expect(service.updateUserMute).not.toHaveBeenCalled();
    expect(service.updateUserVideo).not.toHaveBeenCalled();
    expect(roomEmit).not.toHaveBeenCalled();
  });
});
