/* eslint-disable prettier/prettier */
import { Controller, Get, Request, Post, Put, Body, Delete, Param } from '@nestjs/common';
import { MeetService } from './meet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateMeetDto, GetMeetDto, UpdateMeetDto } from './dtos/createmeet.dto';
import { IdParamDto } from 'src/common/schemas';

@ApiTags('Reuniões')
@ApiBearerAuth()
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

    @Get(':id')
    async getMeetById(@Request() req, @Param() params: IdParamDto) {
        const { userId } = req?.user;
        const { id } = params;

        return await this.meetService.getMeetById(id, userId);
    }

    @Post()
    async createMeet(@Request() req, @Body() dto: CreateMeetDto) {
        const { userId } = req?.user;
        await this.meetService.createMeet(userId, dto);
    }

    @Delete(':id')
    async deleteMeet(@Request() req, @Param() params: IdParamDto) {
        const { userId } = req?.user;
        const { id } = params;
        await this.meetService.deleteMeetByUser(userId, id);
    }

    @Get('objects/:id')
    async getObjectsByMeetId(@Request() req, @Param() params: IdParamDto) {
        const { userId } = req?.user;
        const { id } = params;
        return await this.meetService.getMeetObjects(id, userId);
    }

    @Put(':id')
    async updateMeet(@Request() req, @Param() params: IdParamDto, @Body() dto: UpdateMeetDto) {
        const { userId } = req?.user;
        const { id } = params;
        await this.meetService.update(id, userId, dto);
    }

}
