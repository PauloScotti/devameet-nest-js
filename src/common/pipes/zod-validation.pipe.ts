/* eslint-disable prettier/prettier */
import { BadRequestException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

const toMessages = (error: ZodError) => error.errors.map(e => e.message);

// Mantém o formato de erro do class-validator ({ message: string[] }) consumido pelo front.
export const HttpZodValidationPipe = createZodValidationPipe({
    createValidationException: (error: ZodError) => new BadRequestException(toMessages(error)),
});

export const WsZodValidationPipe = createZodValidationPipe({
    createValidationException: (error: ZodError) => new WsException(toMessages(error)),
});
