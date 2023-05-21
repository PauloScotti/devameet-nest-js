/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meet, MeetDocument } from 'src/meet/schemas/meet.schema';
import { MeetObject, MeetObjectDocument } from 'src/meet/schemas/meetobject.schema';
import { Position, PositionDocument } from './schemas/position.schema';
import { UserService } from 'src/user/user.service';
import { RoomMessgesHelper } from './helpers/roommessages.helper';
import { UpdateUserPositionDto } from './dtos/updateposition.dto';
import { ToglMuteDto } from './dtos/toglMute.dto';
import { PositionClone, PositionCloneDocument } from './schemas/positionclone.schema';

@Injectable()
export class RoomService {
    private logger = new Logger(RoomService.name);

    constructor(
        @InjectModel(Meet.name) private readonly meetModel: Model<MeetDocument>,
        @InjectModel(MeetObject.name) private readonly objectModel: Model<MeetObjectDocument>,
        @InjectModel(Position.name) private readonly positionModel: Model<PositionDocument>,
        @InjectModel(PositionClone.name) private readonly positionCloneModel: Model<PositionCloneDocument>,
        private readonly userService: UserService
    ) { }

    async getRoom(link: string) {
        this.logger.debug(`getRoom - ${link}`);

        const meet = await this._getMeet(link);
        const objects = await this.objectModel.find({ meet });

        return {
            link,
            name: meet.name,
            color: meet.color,
            objects
        };

    }

    async listUsersPositionByLink(link: string) {
        this.logger.debug(`listUsersPositionByLink - ${link}`);

        const meet = await this._getMeet(link);
        return await this.positionModel.find({ meet });
    }

    async deleteUsersPosition(clientId: string) {
        this.logger.debug(`deleteUsersPositionByLink - ${clientId}`);
        return await this.positionModel.deleteMany({ clientId });
    }

    async updateUserPosition(clientId: string, dto: UpdateUserPositionDto) {
        this.logger.debug(`listUsersPositionByLink - ${dto.link}`);

        const meet = await this._getMeet(dto.link);
        const user = await this.userService.getUserById(dto.userId);

        if (!user) {
            throw new BadRequestException(RoomMessgesHelper.JOIN_USER_NOT_VALID)
        }

        const position = {
            ...dto,
            clientId,
            user,
            meet,
            name: user.name,
            avatar: user.avatar,
        }

        const usersInRoom = await this.positionModel.find({ meet });
        const loogedUserInRoom = usersInRoom.find(u =>
            u.user.toString() === user._id.toString() || u.clientId === clientId);

        const usersWereInRoom = await this.positionCloneModel.find({ meet });
        const loogedUserWereInRoom = usersWereInRoom.find(u =>
            u.user.toString() === user._id.toString() || u.clientId === clientId);

        if (loogedUserInRoom) {

            this.logger.log(`loogedUserInRoom - ${loogedUserInRoom}`);
            await this.positionModel.findByIdAndUpdate({ _id: loogedUserInRoom._id }, position);
            await this.positionCloneModel.findByIdAndUpdate({ _id: loogedUserWereInRoom._id }, position);
        } else if (loogedUserWereInRoom) {
            if (usersInRoom && usersInRoom.length > 10) {
                throw new BadRequestException(RoomMessgesHelper.ROOM_MAX_USERS)
            };

            this.logger.log(`loogedUserWereInRoom - ${loogedUserWereInRoom}`);

            await this.positionModel.create(position);
            await this.positionCloneModel.findByIdAndUpdate({ _id: loogedUserInRoom._id }, position);

        } else {
            if (usersInRoom && usersInRoom.length > 10) {
                throw new BadRequestException(RoomMessgesHelper.ROOM_MAX_USERS)
            };

            await this.positionModel.create(position);
            await this.positionCloneModel.create(position);
        }
    }

    async updateUserMute(dto: ToglMuteDto) {
        this.logger.debug(`updateUserMute - ${dto.link} - ${dto.userId}`);

        const meet = await this._getMeet(dto.link);
        const user = await this.userService.getUserById(dto.userId);
        await this.positionModel.updateMany({ user, meet }, { muted: dto.muted });
        await this.positionCloneModel.updateMany({ user, meet }, { muted: dto.muted });
    }

    async _getMeet(link: string) {
        const meet = await this.meetModel.findOne({ link });
        if (!meet) {
            throw new BadRequestException(RoomMessgesHelper.JOIN_LINK_NOT_VALID)
        }

        return meet;
    }
}
