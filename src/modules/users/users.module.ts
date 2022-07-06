import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { Code, CodeSchema } from "./schemas/code.schema";
import { CodesService } from "./codes.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Code.name, schema: CodeSchema },
    ]),
  ],
  providers: [UsersService, CodesService],
  exports: [UsersService, CodesService],
})
export class UsersModule {}
