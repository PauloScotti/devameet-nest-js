/* eslint-disable prettier/prettier */

import { IsBoolean } from "class-validator";
import { JoinRoomDto } from "./joinroom.dto";
import { RoomMessgesHelper } from "../helpers/roommessages.helper";

export class ToglMuteDto extends JoinRoomDto {

    @IsBoolean({ message: RoomMessgesHelper.MUTE_NOT_VALID })
    muted: boolean;
}