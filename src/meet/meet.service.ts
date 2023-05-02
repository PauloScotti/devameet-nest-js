/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Meet, MeetDocument } from './schemas/meet.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from 'src/user/user.service';
import { CreateMeetDto } from './dtos/createmeet.dto';
import { generateLink } from './helpers/linkgenerator.helper';
import { MeetObject, MeetObjectDocument } from './schemas/meetobject.schema';
import { UpdateMeetDto } from './dtos/updatemeet.dto';
import { MeetMessagesHelper } from './helpers/meetmessages.helper';

@Injectable()
export class MeetService {
    private logger = new Logger(MeetService.name);

    constructor(
        @InjectModel(Meet.name) private model: Model<MeetDocument>,
        @InjectModel(MeetObject.name) private objectModel: Model<MeetObjectDocument>,
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

    async getMeetObjects(meetId: string, userId: string) {
        this.logger.debug(`getMeetObjects -  ${userId} - ${meetId}`);

        const user = await this.userService.getUserById(userId);
        const meet = await this.model.findOne({ user, _id: meetId });

        return await this.objectModel.find({ meet });
    }

    async update(meetId: string, userId: string, dto: UpdateMeetDto) {
        this.logger.debug(`update -  ${userId} - ${meetId}`);

        const user = await this.userService.getUserById(userId);
        const meet = await this.model.findOne({ user, _id: meetId });

        if (!meet) {
            throw new BadRequestException(MeetMessagesHelper.UPDATE_MEET_NOT_VALID);
        }

        this.logger.debug('update - set new values on meet');
        meet.name = dto.name;
        meet.color = dto.color;
        await this.model.findByIdAndUpdate({ _id: meetId }, meet);

        await this.objectModel.deleteMany({ meet });

        let objectPayload;
        this.logger.debug('update - insert new objects');
        for (const object of dto.objects) {
            objectPayload = {
                meet,
                ...object
            }

            console.log(objectPayload)
            await this.objectModel.create(objectPayload);
        }
    }

}
