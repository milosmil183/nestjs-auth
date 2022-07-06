import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CreateCodeDto } from "../users/dto/create-code.dto";
import { VerifyCodeDto } from "../users/dto/verify-code.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Request() req) {
    return this.authService.register(req.body);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post("request-sms-code")
  async requestSMSCode(@Request() req, @Body() createCodeDto: CreateCodeDto) {
    return this.authService.requestSms(req.user, createCodeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("request-google-code")
  async requestGoogleCode(@Request() req) {
    return this.authService.requestGoogleCode(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post("verify-code")
  async verifyCode(@Request() req, @Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(req.user._id, verifyCodeDto);
  }
}
