/* eslint-disable prettier/prettier */
import { Controller, Get, Request, Post, Body, Delete, Param } from '@nestjs/common';
import { MeetService } from './meet.service';
import { GetMeetDto } from './dtos/getmeet.dto';
import { CreateMeetDto } from './dtos/createmeet.dto';

@Controller('meet')
export class MeetController {
    constructor(
        private readonly meetService: MeetService
    ) { }

    @Get()
    async getUser(@Request() req) {
        const { userId } = req?.user;

        const result = await this.meetService.getMeetsByUser(userId);

        return result.map(m => ({
            id: m._id.toString(),
            name: m.name,
            color: m.color,
            link: m.link
        } as GetMeetDto));
    }

    @Post()
    async createMeet(@Request() req, @Body() dto: CreateMeetDto) {
        const { userId } = req?.user;
        await this.meetService.createMeet(userId, dto);
    }

    @Delete(':id')
    async deleteMeet(@Request() req, @Param() params) {
        const { userId } = req?.user;
        const { id } = params;
        await this.meetService.deleteMeetByUser(userId, id);
    }
}
