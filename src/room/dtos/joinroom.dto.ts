/* eslint-disable prettier/prettier */

import { IsNotEmpty } from "class-validator";
import { RoomMessgesHelper } from "../helpers/roommessages.helper";

export class JoinRoomDto {

    @IsNotEmpty({ message: RoomMessgesHelper.JOIN_USER_NOT_VALID })
    userId: string;

    @IsNotEmpty({ message: RoomMessgesHelper.JOIN_LINK_NOT_VALID })
    link: string;
}