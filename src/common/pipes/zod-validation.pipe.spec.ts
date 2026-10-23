/* eslint-disable prettier/prettier */
import { BadRequestException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { HttpZodValidationPipe, WsZodValidationPipe } from './zod-validation.pipe';
import { ToglVideoDto } from 'src/room/dtos/toglVideo.dto';
import { RoomMessgesHelper } from 'src/room/helpers/roommessages.helper';

describe('ZodValidationPipes', () => {
  const metadata = { type: 'body', metatype: ToglVideoDto } as const;

  it('HTTP: lança BadRequest com a lista de mensagens', () => {
    try {
      new HttpZodValidationPipe().transform({ video: 'x' }, metadata);
      fail('deveria lançar');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.getResponse().message).toEqual([RoomMessgesHelper.VIDEO_NOT_VALID]);
    }
  });

  it('WS: lança WsException com a lista de mensagens', () => {
    try {
      new WsZodValidationPipe().transform({}, metadata);
      fail('deveria lançar');
    } catch (e) {
      expect(e).toBeInstanceOf(WsException);
      expect(e.getError()).toEqual([RoomMessgesHelper.VIDEO_NOT_VALID]);
    }
  });

  it('retorna o payload validado', () => {
    expect(new WsZodValidationPipe().transform({ video: true }, metadata)).toEqual({ video: true });
  });
});
