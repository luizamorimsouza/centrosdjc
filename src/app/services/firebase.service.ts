import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { Auth, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Database, getDatabase } from "firebase/database";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private initialized = false;

  constructor() { }

  private initializing(): Promise<void> {
    // Precisamos disso pois os components podem precisar ser inicialiado
    return new Promise(resolve => {
      if (this.initialized) {
        resolve();
        return;
      }

      const timer = setInterval(() => {
        if (this.initialized) {
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  }

  async initialize(): Promise<void> {
    initializeApp(environment.firebaseConfig);

    try {
      await signInWithEmailAndPassword(
        getAuth(),
        environment.firebaseAuth.login,
        environment.firebaseAuth.pass
      );
    } catch (e) {
      console.error();
    }

    this.initialized = true;
  }

  /**
   * Retorna uma instancia do Realtime Database op&oacute;s a inicializa&ccedil;&atilde;o completa
   * do firebase
   */
  public async database(): Promise<Database> {
    await this.initializing();
    return getDatabase();
  }

  public async auth(): Promise<Auth> {
    await this.initializing();
    return getAuth();
  }
}
