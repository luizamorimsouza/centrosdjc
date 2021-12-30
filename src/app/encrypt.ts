import { AES, enc, SHA256 } from 'crypto-js';
import { environment } from 'src/environments/environment';

export function encrypt(value: string): string {
  return AES.encrypt(value, environment.secret).toString();
}

export function decrypt(data: string): string {
  return AES.decrypt(data, environment.secret).toString(enc.Utf8);
}

export function hash(value: string) {
  return enc.Hex.stringify(SHA256(value + 'CSDJC'));
}
