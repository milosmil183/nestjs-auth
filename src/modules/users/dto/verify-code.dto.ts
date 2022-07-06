import { VerificationType } from "../../../types/common";

export class VerifyCodeDto {
  code: string;
  type: VerificationType;
  secret: string;
  email: boolean;
}
