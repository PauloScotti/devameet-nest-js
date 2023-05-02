/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { Meet, MeetDocument } from './schemas/meet.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from 'src/user/user.service';
import { CreateMeetDto } from './dtos/createmeet.dto';
import { generateLink } from './helpers/linkgenerator.helper';

@Injectable()
export class MeetService {
    private logger = new Logger(MeetService.name);

    constructor(
        @InjectModel(Meet.name) private model: Model<MeetDocument>,
        private readonly userService: UserService
    ) { }

    async getMeetsByUser(userId: string) {
        this.logger.debug('getMeetsByUser - ' + userId);
        return await this.model.find({ user: userId });
    }

    async createMeet(userId: string, dto: CreateMeetDto) {
        this.logger.debug('createMeet - ' + userId);

        const user = await this.userService.getUserById(userId);

        const meet = {
            ...dto,
            user,
            link: generateLink()
        };

        const createdMeet = new this.model(meet);
        return await createdMeet.save();
    }

    async deleteMeetByUser(userId: string, meetId: string) {
        this.logger.debug(`deleteMeetByUser -  ${userId} - ${meetId}`);
        return await this.model.deleteOne({ user: userId, _id: meetId });
    }

}
