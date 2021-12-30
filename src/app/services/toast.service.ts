import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastr: ToastrService
  ) { }

  public success(message: string): void {
    this.toastr.success(message, undefined, { positionClass: 'toast-bottom-center' });
  }

  public error(message: string): void {
    this.toastr.error(message, undefined, { positionClass: 'toast-bottom-center' });
  }
}
