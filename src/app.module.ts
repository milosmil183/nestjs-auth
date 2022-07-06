import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: [".env", ".env.production"],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
