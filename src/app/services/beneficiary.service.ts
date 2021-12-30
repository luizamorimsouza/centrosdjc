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

  private normalizeCPF(cpf: string | undefined): string | undefined {
    return !!cpf ? cpf.replace(/[^0-9]/g, '').trim() : cpf;
  }

  private normalizeName(name: string, isSlug = false): string {
    if (!!name) {
      name = name.trim();
      if (isSlug) {
        name = name.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      }
    }

    return name;
  }

  public async create(name: string, cpf: string, status: Status): Promise<Beneficiary> {
    cpf = this.normalizeCPF(cpf) as string;
    name = this.normalizeName(name);

    const db = await this.firebase.database();
    const beneficiary = new Beneficiary()
    beneficiary.name = encrypt(name);
    beneficiary.nameHash = hash(this.normalizeName(name, true));
    beneficiary.status = status;

    if (cpf) {
      beneficiary.cpf = encrypt(cpf);
      beneficiary.cpfHash = hash(cpf);
    }

    // Get a key for a new Beneficiary.
    beneficiary.id = push(child(ref(db), '/beneficiaries')).key as string;

    // Write the new beneficiary's data
    const updates: any = {};
    updates[`/beneficiaries/${beneficiary.id}`] = beneficiary;
    await update(ref(db), updates);

    beneficiary.name = decrypt(beneficiary.name);
    
    if (cpf) {
      beneficiary.cpf = cpf;
    }

    return beneficiary;
  }

  public async update(beneficiary: Beneficiary): Promise<Beneficiary> {
    const cpf = this.normalizeCPF(beneficiary.cpf);
    const name = this.normalizeName(beneficiary.name);

    const db = await this.firebase.database();
    const updatedBeneficiary: Beneficiary = {
      id: beneficiary.id,
      name: encrypt(beneficiary.name),
      nameHash: hash(this.normalizeName(name, true)),
      status: beneficiary.status
    };

    if (cpf) {
      updatedBeneficiary.cpf = encrypt(cpf);
      updatedBeneficiary.cpfHash = hash(cpf);
    }

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
      beneficiaries.push(new Beneficiary(childSnapshot.val()));
    });

    return beneficiaries;
  }

  public async search(search: string): Promise<Beneficiary> {
    // OBS Space in final regex is important
    const isName = /^[a-zA-Z\u00C0-\u00ff ]+$/.test(search);
    let field = 'nameHash';

    if (isName) {
      search = this.normalizeName(search, true);
    } else {
      field = 'cpfHash';
      search = this.normalizeCPF(search) as string;
    }

    const db = await this.firebase.database();
    const beneficiaryRef = query(ref(db, '/beneficiaries'), orderByChild(field), equalTo(hash(search)));
    const snapshot = await get(beneficiaryRef);

    if (!snapshot.exists()) {
      throw { msg: 'Beneficiário não encontrado.' };
    }

    const snapshotData = snapshot.val();
    return new Beneficiary(snapshotData[Object.keys(snapshotData)[0]]);
  }
}
