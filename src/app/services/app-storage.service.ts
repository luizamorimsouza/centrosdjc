import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
import { Storage } from '@ionic/storage-angular';
import { AES, enc, MD5 } from 'crypto-js';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AppStorageService {

  private readonly KEY_SECRET = '_s'

  constructor(
    private storage: Storage
  ) {
    this.storage.create();
  }

  private async getSecret(): Promise<string> {
    let secret = await this.storage.get(this.KEY_SECRET);

    if (secret) {
      secret = AES.decrypt(secret, environment.secret).toString(enc.Utf8);
    } else {
      secret = enc.Hex.stringify(MD5(moment().format('x') + Math.random() + 'CSDJC'));

      const s = AES.encrypt(secret, environment.secret).toString();
      await this.storage.set(this.KEY_SECRET, s);
    }

    return secret;
  }

  public async get(key: string, decrypt = false): Promise<any> {
    let data = await this.storage.get(key);

    if (data && decrypt && environment.production) {
      data = JSON.parse(AES.decrypt(data, await this.getSecret()).toString(enc.Utf8));
    }

    return data;
  }

  public async set(key: string, value: any, encrypt = false): Promise<any> {
    let data = value;

    if (encrypt && environment.production) {
      data = AES.encrypt(JSON.stringify(data), await this.getSecret()).toString();
    }

    return this.storage.set(key, data);
  }

  public remove(key: string): Promise<any> {
    return this.storage.remove(key);
  }

  public keys(): Promise<string[]> {
    return this.storage.keys();
  }
}
