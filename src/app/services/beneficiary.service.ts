import { Injectable } from '@angular/core';
import { Beneficiary } from '../models/beneficiary.model';
import { FirebaseService } from './firebase.service';
import { child, ref, push, update, remove, get, query, orderByChild, equalTo } from "firebase/database";
import { decrypt, encrypt, hash } from '../encrypt';
import { Status } from '../models/status.model';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {

  constructor(
    private firebase: FirebaseService
  ) { }

  private normalizeCPF(cpf: string): string {
    return !!cpf ? cpf.replace(/[^0-9]/g, '') : cpf;
  }

  public async create(name: string, cpf: string, status: Status): Promise<Beneficiary> {
    cpf = this.normalizeCPF(cpf);

    const db = await this.firebase.database();
    const beneficiary = new Beneficiary()
    beneficiary.cpf = encrypt(cpf);
    beneficiary.cpfHash = hash(cpf);
    beneficiary.name = encrypt(name);
    beneficiary.nameHash = hash(name.toLowerCase());
    beneficiary.status = status;
    // Get a key for a new Beneficiary.
    beneficiary.id = push(child(ref(db), '/beneficiaries')).key as string;

    // Write the new beneficiary's data
    const updates: any = {};
    updates[`/beneficiaries/${beneficiary.id}`] = beneficiary;
    await update(ref(db), updates);

    beneficiary.name = decrypt(beneficiary.name);
    beneficiary.cpf = decrypt(beneficiary.cpf);

    return beneficiary;
  }

  public async update(beneficiary: Beneficiary): Promise<Beneficiary> {
    const cpf = this.normalizeCPF(beneficiary.cpf);

    const db = await this.firebase.database();
    const updatedBeneficiary: Beneficiary = {
      id: beneficiary.id,
      cpf: encrypt(cpf),
      cpfHash: hash(cpf),
      name: encrypt(beneficiary.name),
      nameHash: hash(beneficiary.name.toLowerCase()),
      status: beneficiary.status
    };

    // Write the new beneficiary's data
    const updates: any = {};
    updates[`/beneficiaries/${beneficiary.id}`] = updatedBeneficiary;
    await update(ref(db), updates);

    return beneficiary;
  }

  public async delete(id: string): Promise<void> {
    const db = await this.firebase.database();
    const beneficiaryRef = child(ref(db), `/beneficiaries/${id}`);
    return await remove(beneficiaryRef);
  }

  public async list(): Promise<Beneficiary[]> {
    const beneficiaries: Beneficiary[] = [];
    const db = await this.firebase.database();
    const snapshot = await get(ref(db, '/beneficiaries'));

    snapshot.forEach((childSnapshot) => {
      const childData = childSnapshot.val();
      const beneficiary: Beneficiary = {
        id: childData.id,
        cpf: decrypt(childData.cpf),
        cpfHash: childData.cpfHash,
        name: decrypt(childData.name),
        nameHash: childData.nameHash,
        status: childData.status
      }

      beneficiaries.push(beneficiary);
    });

    return beneficiaries;
  }

  public async getStatus(search: string): Promise<Status> {
    // OBS Space in final regex is important
    const isName = /^[a-zA-Z\u00C0-\u00ff ]+$/.test(search);
    let field = 'cpfHash';

    if (isName) {
      search = search.toLowerCase();
      field = 'nameHash';
    } else {
      search = this.normalizeCPF(search);
    }

    const db = await this.firebase.database();
    const beneficiaryRef = query(ref(db, '/beneficiaries'), orderByChild(field), equalTo(hash(search)));
    const snapshot = await get(beneficiaryRef);

    if (!snapshot.exists()) {
      throw { msg: 'Beneficiário não encontrado.' };
    }

    const snapshotData = snapshot.val();
    return snapshotData[Object.keys(snapshotData)[0]].status;
  }
}
