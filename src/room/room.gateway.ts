/* eslint-disable prettier/prettier */
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RoomService } from './room.service';
import { Logger, UsePipes } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { JoinRoomDto } from './dtos/joinroom.dto';
import { UpdateUserPositionDto } from './dtos/updateposition.dto';
import { ToglMuteDto } from './dtos/toglMute.dto';
import { ToglVideoDto } from './dtos/toglVideo.dto';
import { CallUserDto, MakeAnswerDto } from './dtos/signaling.dto';
import { WsZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { RoomMessgesHelper } from './helpers/roommessages.helper';
import { generateXYPosition } from './helpers/createposition.helper';

type ActiveSocketType = {
  room: string;
  id: string;
  userId: string;
}

@WebSocketGateway({ cors: true })
@UsePipes(new WsZodValidationPipe())
export class RoomGateway implements OnGatewayInit, OnGatewayDisconnect {

  constructor(
    private readonly service: RoomService,
    private readonly jwtService: JwtService,
  ) { }

  @WebSocketServer() wss: Server;

  private logger = new Logger(RoomGateway.name);
  private activeSockets: ActiveSocketType[] = [];

  afterInit(server: Server) {
    this.logger.log('Gateway initializes');
    server.use((client, next) => this.authenticate(client, next));
  }

  authenticate(client: Socket, next: (err?: Error) => void) {
    try {
      const { token } = client.handshake.auth ?? {};
      const payload = this.jwtService.verify(token, { secret: process.env.USER_JWT_SECRET_KEY });
      client.data.userId = payload.sub;
      next();
    } catch {
      this.logger.warn(`Client: ${client.id} ${RoomMessgesHelper.SOCKET_UNAUTHORIZED}`);
      next(new Error(RoomMessgesHelper.SOCKET_UNAUTHORIZED));
    }
  }

  async handleDisconnect(client: any) {
    const existingOnSocket = this.getActiveSocket(client);

    if (!existingOnSocket) return;

    this.activeSockets = this.activeSockets.filter(
      socket => socket.id !== client.id
    );

    await this.service.deleteUsersPosition(client.id);
    client.to(existingOnSocket.room).emit(`${existingOnSocket.room}-remove-user`, { socketId: client.id });

    this.logger.debug(`Client: ${client.id} disconnected`);
  }

  @SubscribeMessage('join')
  async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() payload: JoinRoomDto) {
    const { link, video } = payload;
    const { userId } = client.data;

    const existingOnSocket = this.activeSockets.find(
      socket => socket.room === link && socket.id === client.id
    );

    if (!existingOnSocket) {
      await this.service.updateUserPosition(client.id, {
        link,
        userId,
        video,
        x: generateXYPosition(),
        y: generateXYPosition(),
        orientation: 'down'
      });

      this.activeSockets.push({ room: link, id: client.id, userId });
      client.join(link);

      const users = await this.service.listUsersPositionByLink(link);

      this.wss.to(link).emit(`${link}-update-user-list`, { users });
      client.to(link).emit(`${link}-add-user`, { user: client.id });
    }

    this.logger.debug(`Socket client: ${client.id} start to join romm ${link}`);
  }

  @SubscribeMessage('move')
  async handleMovement(@ConnectedSocket() client: Socket, @MessageBody() payload: UpdateUserPositionDto): Promise<void> {
    const activeSocket = this.getActiveSocket(client);
    if (!activeSocket) return;

    const { room, userId } = activeSocket;
    this.logger.log('Socket client: ' + client.id + ' start to move in room: ' + room);

    await this.service.updateUserPosition(client.id, { ...payload, link: room, userId });
    await this.emitUserList(room);
  }

  @SubscribeMessage('toggl-mute-user')
  async handleToglMute(@ConnectedSocket() client: Socket, @MessageBody() payload: ToglMuteDto) {
    const activeSocket = this.getActiveSocket(client);
    if (!activeSocket) return;

    const { room, userId } = activeSocket;
    await this.service.updateUserMute(room, userId, payload);
    await this.emitUserList(room);
  }

  @SubscribeMessage('toggl-video-user')
  async handleToglVideo(@ConnectedSocket() client: Socket, @MessageBody() payload: ToglVideoDto) {
    const activeSocket = this.getActiveSocket(client);
    if (!activeSocket) return;

    const { room, userId } = activeSocket;
    await this.service.updateUserVideo(room, userId, payload);
    await this.emitUserList(room);
  }

  @SubscribeMessage('call-user')
  async callUser(@ConnectedSocket() client: Socket, @MessageBody() data: CallUserDto) {
    if (!this.isInSameRoom(client, data.to)) return;

    this.logger.log(`callUser: ${client.id} to: ${data.to}`);
    client.to(data.to).emit('call-made', {
      offer: data.offer,
      socket: client.id
    });
  }

  @SubscribeMessage('make-answer')
  async makeAnswer(@ConnectedSocket() client: Socket, @MessageBody() data: MakeAnswerDto) {
    if (!this.isInSameRoom(client, data.to)) return;

    this.logger.log(`makeAnswer: ${client.id} to: ${data.to}`);
    client.to(data.to).emit('answer-made', {
      answer: data.answer,
      socket: client.id
    });
  }

  private getActiveSocket(client: Socket) {
    return this.activeSockets.find(socket => socket.id === client.id);
  }

  private isInSameRoom(client: Socket, targetSocketId: string) {
    const from = this.getActiveSocket(client);
    return !!from && this.activeSockets.some(
      socket => socket.id === targetSocketId && socket.room === from.room
    );
  }

  private async emitUserList(room: string) {
    const users = await this.service.listUsersPositionByLink(room);
    this.wss.to(room).emit(`${room}-update-user-list`, { users });
  }
}
