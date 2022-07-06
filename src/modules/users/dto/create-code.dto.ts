import { VerificationType } from "../../../types/common";

export class CreateCodeDto {
  type: VerificationType;
  source: string;
}
