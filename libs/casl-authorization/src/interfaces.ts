import { CaslActionEnum } from "./enums";

// 2️⃣ Define the `Permission` interface
export interface ICaslPermission {
  action: CaslActionEnum;
  subject: string;
}