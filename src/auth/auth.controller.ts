import { Controller, Post, HttpCode, HttpStatus, Body } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { AuthService } from "./auth.service";
import { LoginDto, LoginResponseDto } from "./dtos/login.dto";
import { RegisterDto } from "src/user/dtos/register.dto";
import { IsPublic } from "./decorators/ispublic.decorator";

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    @ApiOperation({ summary: 'Entrar e receber o token de acesso' })
    @ZodResponse({ status: 200, type: LoginResponseDto })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('register')
    @HttpCode(HttpStatus.OK)
    @IsPublic()
    @ApiOperation({ summary: 'Criar conta' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }
}
