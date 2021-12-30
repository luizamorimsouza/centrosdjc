import { Component } from '@angular/core';
import { Status } from 'src/app/models/status.model';
import { BeneficiaryService } from 'src/app/services/beneficiary.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  search!: string;
  status!: Status;
  loading = false;

  constructor(
    private beneficiaryService: BeneficiaryService
  ) { }

  async submit(): Promise<void> {
    this.loading = true;

    try {
      this.status = await this.beneficiaryService.getStatus(this.search);
      this.search = '';
    } catch (e: any) {
      const message = e.msg || e;
      if (!e.msg) {
        console.error(e);
      }

      this.status = {
        id: '',
        label: message,
        color: 'danger'
      };
    }

    this.loading = false;
  }
}
