import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { join } from "path";
import { PugAdapter } from "@nestjs-modules/mailer/dist/adapters/pug.adapter";

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: "smtp.office365.com",
        port: parseInt(process.env.MAIL_PORT),
        secure: true,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.MAIL_FROM_ADDRESS}>`,
      },
      template: {
        dir: join(__dirname, "templates"),
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
