import { Injectable } from '@angular/core';
import { Status } from '../models/status.model';
import { FirebaseService } from './firebase.service';
import { child, ref, push, update, remove, get } from "firebase/database";

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  constructor(
    private firebase: FirebaseService
  ) { }

  public async create(label: string, color: string): Promise<Status> {
    const db = await this.firebase.database();

    const status = new Status();
    status.label = label;
    status.color = color;
    // Get a key for a new Status.
    status.id = push(child(ref(db), '/status')).key as string;

    // Write the new status's data
    const updates: any = {};
    updates[`/status/${status.id}`] = status;
    await update(ref(db), updates);

    return status;
  }

  public async delete(id: string): Promise<void> {
    const db = await this.firebase.database();
    const statusRef = child(ref(db), `/status/${id}`);
    return await remove(statusRef);
  }

  public async list(): Promise<Status[]> {
    const statuses: Status[] = [];
    const db = await this.firebase.database();
    const snapshot = await get(ref(db, '/status'));

    snapshot.forEach((childSnapshot) => {
      const childData = childSnapshot.val();
      const status: Status = {
        id: childData.id,
        label: childData.label,
        color: childData.color
      }

      statuses.push(status);
    });

    return statuses;
  }
}
