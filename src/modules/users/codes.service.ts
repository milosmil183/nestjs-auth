import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Code, CodeDocument } from "./schemas/code.schema";
import { CreateCodeDto } from "./dto/create-code.dto";

@Injectable()
export class CodesService {
  constructor(@InjectModel(Code.name) private codeModel: Model<CodeDocument>) {}

  async create(createCodeDto: CreateCodeDto): Promise<Code> {
    const createdCode = new this.codeModel({
      ...createCodeDto,
      _id: new mongoose.Types.ObjectId(),
    });
    return createdCode.save();
  }

  async findOne(userId: string, type: string): Promise<Code> {
    return this.codeModel.findOne({ userId, type });
  }

  async deleteByUser(userId: string) {
    return this.codeModel.deleteMany({ user: userId });
  }
}
