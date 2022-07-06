import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { User } from "../users/schemas/user.schema";

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      from: `"No Reply" <${process.env.MAIL_FROM_ADDRESS}>`,
      subject: "Welcome!",
      html: `<b>Hi ${user.firstName}, Welcome!</b>`,
    });
  }
}
