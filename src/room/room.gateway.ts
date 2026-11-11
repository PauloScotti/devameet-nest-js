import { OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RoomService } from './room.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import type { ZodType } from 'zod';
import { joinRoomSchema, signalSchema, toggleMuteSchema, updateUserPositionSchema } from './dtos/room.dto';
import { generateXYPosition } from './helpers/createposition.helper';

type ActiveSocketType = {
  room: string;
  id: string;
  userId: string;
}

@WebSocketGateway({ cors: true })
export class RoomGateway implements OnGatewayInit, OnGatewayDisconnect {

  constructor(private readonly service: RoomService) { }

  @WebSocketServer() wss: Server;

  private logger = new Logger(RoomGateway.name);
  private activeSockets: ActiveSocketType[] = [];

  // Valida a mensagem recebida pelo socket. Mensagem inválida é descartada e só
  // quem a enviou é avisado.
  private parse<T>(client: Socket, schema: ZodType<T>, payload: unknown): T | null {
    const result = schema.safeParse(payload);
    if (!result.success) {
      client.emit('room-error', { message: result.error.issues[0].message });
      return null;
    }
    return result.data;
  }

  // Erros de regra (sala cheia, link inválido) voltam só para quem enviou.
  private async guard(client: Socket, action: () => Promise<void>) {
    try {
      await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível concluir a ação';
      this.logger.warn(`Socket ${client.id}: ${message}`);
      client.emit('room-error', { message });
    }
  }

  afterInit() {
    this.logger.log('Gateway initializes');
  }

  async handleDisconnect(client: any) {
    const existingOnSocket = this.activeSockets.find(
      socket => socket.id === client.id
    );

    if (!existingOnSocket) return;

    this.activeSockets = this.activeSockets.filter(
      socket => socket.id !== client.id
    );

    await this.service.deleteUsersPosition(client.id);
    client.broadcast.emit(`${existingOnSocket.room}-remove-user`, { socketId: client.id });

    this.logger.debug(`Client: ${client.id} disconnected`);
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, payload: unknown) {
    const data = this.parse(client, joinRoomSchema, payload);
    if (!data) return;
    const { link, userId } = data;

    const existingOnSocket = this.activeSockets.find(
      socket => socket.room === link && socket.id === client.id
    );

    if (existingOnSocket) return;

    await this.guard(client, async () => {
      await this.service.updateUserPosition(client.id, {
        link,
        userId,
        x: generateXYPosition(),
        y: generateXYPosition(),
        orientation: 'down'
      });
      this.activeSockets.push({ room: link, id: client.id, userId });

      const users = await this.service.listUsersPositionByLink(link);
      this.wss.emit(`${link}-update-user-list`, { users });
      client.broadcast.emit(`${link}-add-user`, { user: client.id });
      this.logger.debug(`Socket client: ${client.id} joined room ${link}`);
    });
  }

  @SubscribeMessage('move')
  async handleMovement(client: Socket, payload: unknown): Promise<void> {
    const data = this.parse(client, updateUserPositionSchema, payload);
    if (!data) return;

    await this.guard(client, async () => {
      await this.service.updateUserPosition(client.id, data);
      const users = await this.service.listUsersPositionByLink(data.link);
      this.wss.emit(`${data.link}-update-user-list`, { users });
    });
  }

  @SubscribeMessage('toggl-mute-user')
  async handleToglMute(client: Socket, payload: unknown) {
    const data = this.parse(client, toggleMuteSchema, payload);
    if (!data) return;

    await this.guard(client, async () => {
      await this.service.updateUserMute(data);
      const users = await this.service.listUsersPositionByLink(data.link);
      this.wss.emit(`${data.link}-update-user-list`, { users });
    });
  }

  @SubscribeMessage('call-user')
  async callUser(client: Socket, payload: unknown) {
    const data = this.parse(client, signalSchema, payload);
    if (!data) return;

    this.logger.log(`callUser: ${client.id} to: ${data.to}`);
    client.to(data.to).emit('call-made', {
      offer: data.offer,
      socket: client.id
    });
  }

  @SubscribeMessage('make-answer')
  async makeAnswer(client: Socket, payload: unknown) {
    const data = this.parse(client, signalSchema, payload);
    if (!data) return;

    this.logger.log(`makeAnswer: ${client.id} to: ${data.to}`);
    client.to(data.to).emit('answer-made', {
      answer: data.answer,
      socket: client.id
    });
  }
}
