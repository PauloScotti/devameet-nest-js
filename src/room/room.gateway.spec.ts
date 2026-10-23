/* eslint-disable prettier/prettier */
import { RoomGateway } from './room.gateway';
import { RoomService } from './room.service';

describe('RoomGateway - toggl-video-user', () => {
  const users = [{ clientId: 'socket-1', video: false }];
  let service: jest.Mocked<Pick<RoomService, 'updateUserVideo' | 'listUsersPositionByLink' | 'updateUserPosition'>>;
  let gateway: RoomGateway;
  let emit: jest.Mock;

  const client = (id: string) => ({ id, broadcast: { emit: jest.fn() } }) as any;

  beforeEach(async () => {
    service = {
      updateUserVideo: jest.fn(),
      listUsersPositionByLink: jest.fn().mockResolvedValue(users),
      updateUserPosition: jest.fn(),
    };
    gateway = new RoomGateway(service as unknown as RoomService);
    emit = jest.fn();
    gateway.wss = { emit } as any;

    await gateway.handleJoin(client('socket-1'), { link: 'room-1', userId: 'user-1' });
    emit.mockClear();
  });

  it('atualiza o vídeo do usuário vinculado ao socket e emite a lista', async () => {
    await gateway.handleToglVideo(client('socket-1'), { video: false });

    expect(service.updateUserVideo).toHaveBeenCalledWith('room-1', 'user-1', { video: false });
    expect(emit).toHaveBeenCalledWith('room-1-update-user-list', { users });
  });

  it('ignora sockets que não entraram em uma sala', async () => {
    await gateway.handleToglVideo(client('socket-2'), { video: true });

    expect(service.updateUserVideo).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});
