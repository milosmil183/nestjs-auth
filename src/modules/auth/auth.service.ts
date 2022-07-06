import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { CodesService } from "../users/codes.service";
import { CreateCodeDto } from "../users/dto/create-code.dto";
import { VerifyCodeDto } from "../users/dto/verify-code.dto";
import { authenticator } from "otplib";
import * as qrcode from "qrcode";
import * as twilio from "twilio";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private codesService: CodesService,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return user;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(req: any) {
    try {
      await this.usersService.create(req);
      return {
        success: true,
        message: "User created successfully",
      };
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }

  async requestSms(user: any, createCodeDto: CreateCodeDto) {
    const expireAt = new Date();
    const expireIn = 0.5 * 60 * 60 * 1000; // Expire in 30 minutes.
    expireAt.setTime(Date.now() + expireIn);
    const code = AuthService.generatePinCode();
    const additionalData = {
      user: user._id,
      code,
      expireAt,
      verifiedAt: null,
    };
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: `[Veteran Application] Security code: ${code}`,
        from: "+16199142850",
        to: createCodeDto.source,
      });
      await this.codesService.deleteByUser(user._id);
      await this.codesService.create({ ...createCodeDto, ...additionalData });
      return {
        success: true,
        message: "Code sent successfully",
      };
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }

  async requestGoogleCode(user: any) {
    try {
      const secret = authenticator.generateSecret();
      const otpauth = authenticator.keyuri(
        user.email,
        "Veteran Application",
        secret
      );
      const qrcode = await this.generateQRCode(otpauth);
      return {
        success: true,
        message: "Google code generated",
        data: {
          secret,
          qrcode,
        },
      };
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }

  async verifyCode(user: any, verifyCodeDto: VerifyCodeDto) {
    const userId = user._id;
    const code = await this.codesService.findOne(userId, verifyCodeDto.type);
    if (verifyCodeDto.type == "google") {
      const isValid = authenticator.verify({
        token: verifyCodeDto.code,
        secret: verifyCodeDto.secret,
      });
      if (isValid) {
        const createCodeDto = new CreateCodeDto();
        createCodeDto.type = "google";
        const additionalData = {
          user: userId,
          verifiedAt: Date.now(),
        };
        try {
          await this.codesService.deleteByUser(userId);
          await this.codesService.create({
            ...createCodeDto,
            ...additionalData,
          });
          if (verifyCodeDto.email) {
            // await this.mailService.sendEmail(user);
          }
          return {
            success: true,
            message: "Code saved",
          };
        } catch (e) {
          return {
            success: false,
            message: e.message,
          };
        }
      } else {
        return {
          success: false,
          message: "Invalid code",
        };
      }
    } else {
      if (code.code == verifyCodeDto.code) {
        const now = new Date();
        if (code.expireAt > now) {
          if (verifyCodeDto.email) {
            // await this.mailService.sendEmail(user);
          }
          return {
            success: true,
            message: "Successfully verified",
          };
        } else {
          return {
            success: false,
            message: "The code is expired. Please try again.",
          };
        }
      } else {
        return {
          success: false,
          message: "Invalid code",
        };
      }
    }
  }

  private static generatePinCode(length = 6): string {
    let code = "";
    for (let i = 0; i < length; i++) {
      code += `${Math.floor(Math.random() * 10)}`;
    }
    return code;
  }

  private generateQRCode(otpauth: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      qrcode.toDataURL(otpauth, { type: "image/png" }, (error, image) => {
        if (error) {
          reject(error);
        } else {
          resolve(image);
        }
      });
    });
  }
}
