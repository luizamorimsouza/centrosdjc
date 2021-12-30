import { Status } from "./status.model";

export class Beneficiary {
  id!: string;
  cpf!: string;
  cpfHash?: string;
  name!: string;
  nameHash!: string;
  status!: Status;
}
