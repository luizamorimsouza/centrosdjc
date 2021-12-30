import { decrypt } from "../encrypt";
import { Status } from "./status.model";

export class Beneficiary {
  id!: string;
  cpf?: string;
  cpfHash?: string;
  name!: string;
  nameHash!: string;
  status!: Status;

  constructor (beneficiary?: any) {
    if (beneficiary) {
      this.id = beneficiary.id;
      this.name = decrypt(beneficiary.name);
      this.nameHash = beneficiary.nameHash;
      this.status = beneficiary.status;
      
      if (beneficiary.cpf) {
        this.cpf = decrypt(beneficiary.cpf);
        this.cpfHash = beneficiary.cpfHash;
      }
    }
  }
}
