/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoomService } from './room.service';

@ApiTags('Sala')
@ApiBearerAuth()
@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Get(':link')
    async getRoom(@Param() params) {
        const { link } = params;
        return await this.roomService.getRoom(link);
    }
}
