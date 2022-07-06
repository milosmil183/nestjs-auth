import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { User } from "./user.schema";

export type CodeDocument = Code & Document;

@Schema()
export class Code {
  @Prop()
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: User;

  @Prop({ required: true, enum: ["google", "sms"] })
  type: string;

  @Prop({ required: false })
  source: string;

  @Prop({ required: false })
  code: string;

  @Prop({ required: false })
  secret: string;

  @Prop({ required: false })
  expireAt: Date;

  @Prop({ required: false })
  verifiedAt: Date;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const CodeSchema = SchemaFactory.createForClass(Code);
