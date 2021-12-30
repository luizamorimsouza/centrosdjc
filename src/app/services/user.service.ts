import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { AppStorageService } from './app-storage.service';
import { FirebaseService } from './firebase.service';
import { ref, query, get, orderByChild, equalTo, push, child, update } from "firebase/database";
import { hash } from '../encrypt';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly KEY_USER = '_u';

  constructor(
    private storage: AppStorageService,
    private firebase: FirebaseService
  ) { }

  public async create(login: string, name: string, pass: string): Promise<User> {
    const db = await this.firebase.database();
    const user: User = {
      login,
      name,
      pass: hash(pass)
    };

    // Get a key for a new Beneficiary.
    const userId = push(child(ref(db), '/users')).key;

    // Write the new beneficiary's data
    const updates: any = {};
    updates[`/users/${userId}`] = user;
    await update(ref(db), updates);

    return user;
  }

  public async auth(login: string, pass: string): Promise<User> {
    const db = await this.firebase.database();
    const userRef = query(ref(db, '/users'), orderByChild('login'), equalTo(login));
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      throw { msg: 'Usuário não encontrado.' };
    }

    const snapshotData = snapshot.val();
    const user: User = snapshotData[Object.keys(snapshotData)[0]];

    if (user.pass !== hash(pass)) {
      throw { msg: 'Senha inválida.' };
    }

    await this.storage.set(this.KEY_USER, user, true);
    return user;
  }

  public user(): Promise<User> {
    return this.storage.get(this.KEY_USER, true);
  }
}
