/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { hasExpiration } from "../helpers/jwt.helper";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.USER_JWT_SECRET_KEY,
        });
    }

    async validate(payload: any) {
        if (!hasExpiration(payload)) {
            throw new UnauthorizedException();
        }

        return { userId: payload.sub, email: payload.email };
    }
}