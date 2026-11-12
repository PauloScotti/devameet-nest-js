import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { LoginDto } from "./dtos/login.dto";
import { MessagesHelper } from "./helpers/messages.helper";
import { RegisterDto } from "src/user/dtos/register.dto";
import { UserService } from "src/user/user.service";
import { UserMessagesHelper } from "src/user/helpers/user.helper";
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from "./password.util";

@Injectable()
export class AuthService {
    private looger = new Logger(AuthService.name);

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async login(dto: LoginDto) {
        this.looger.debug('login - started');

        // Mesma resposta para e-mail inexistente e senha errada: não revela
        // quais e-mails têm conta.
        const user = await this.userService.getUserByEmail(dto.login);
        const check = user
            ? await verifyPassword(dto.password, user.password)
            : { valid: false, needsRehash: false };
        if (!user || !check.valid) {
            throw new BadRequestException(MessagesHelper.AUTH_PASSWORD_OR_LOGIN_NOT_FOUND)
        }

        if (check.needsRehash) {
            await this.userService.setPassword(user._id.toString(), dto.password);
        }

        const tokenPayload = { email: user.email, sub: user._id.toString() };

        return {
            email: user.email,
            name: user.name,
            token: this.jwtService.sign(tokenPayload)
        }
    }

    async register(dto: RegisterDto) {
        this.looger.debug('register - started');
        if (await this.userService.existsByEmail(dto.email)) {
            throw new BadRequestException(UserMessagesHelper.REGISTER_EMAIL_FOUND)
        }

        await this.userService.create(dto);
    }
}
