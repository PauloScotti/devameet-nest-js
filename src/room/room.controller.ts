/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { RoomService } from './room.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('room')
@ApiBearerAuth()
@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Get(':link')
    @ApiParam({ name: 'link', type: String })
    async getRoom(@Param() params) {
        const { link } = params;
        return await this.roomService.getRoom(link);
    }
}
