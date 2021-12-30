import { Component, OnInit } from '@angular/core';
import { Beneficiary } from 'src/app/models/beneficiary.model';
import { Status } from 'src/app/models/status.model';
import { BeneficiaryService } from 'src/app/services/beneficiary.service';
import { StatusService } from 'src/app/services/status.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  labelStatus!: string;
  colorStatus = 'success';
  statuses: Status[] = [];

  cpfBeneficiary!: string;
  nameBeneficiary!: string;
  statusBeneficiary = '';
  beneficiaries: Beneficiary[] = [];

  edit: {
    [id: string]: Beneficiary
  } = {};

  constructor(
    private toastService: ToastService,
    private beneficiaryService: BeneficiaryService,
    private statusService: StatusService
  ) { }

  async ngOnInit() {
    try {
      this.statuses = await this.statusService.list();
      this.beneficiaries = await this.beneficiaryService.list();
    } catch (e) {
      this.handleError(e);
    }
  }

  private async handleError(e: any): Promise<void> {
    const message = e.msg || e;
    if (!e.msg) {
      console.error(e);
    }

    this.toastService.error(message);
  }

  private findPosition(id: string, list: Array<{ id?: string }>): number {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        return i;
      }
    }

    return -1;
  }

  async createStatus(): Promise<void> {
    try {
      const status = await this.statusService.create(this.labelStatus, this.colorStatus);
      this.labelStatus = '';
      this.statuses.push(status);
    } catch (e) {
      this.handleError(e);
    }
  }

  async deleteStatus(id: string): Promise<void> {
    try {
      await this.statusService.delete(id);
      this.statuses.splice(this.findPosition(id, this.statuses), 1);
    } catch (e) {
      this.handleError(e);
    }
  }

  async createBeneficiary(): Promise<void> {
    try {
      const status = this.statuses[this.findPosition(this.statusBeneficiary, this.statuses)];
      const beneficiary = await this.beneficiaryService.create(
        this.nameBeneficiary,
        this.cpfBeneficiary,
        status
      );
      this.nameBeneficiary = '';
      this.cpfBeneficiary = '';
      this.beneficiaries.unshift(beneficiary);
    } catch (e) {
      this.handleError(e);
    }
  }

  editBeneficiary(beneficiary: Beneficiary): void {
    this.edit[beneficiary.id as string] = beneficiary;
  }

  cancelUpdate(id: string): void {
    delete this.edit[id];
  }

  async updateBeneficiary(beneficiary: Beneficiary): Promise<void> {
    try {
      const status = this.statuses[this.findPosition(
        beneficiary.status.id as string,
        this.statuses
      )];
      beneficiary.status = status;
      await this.beneficiaryService.update(beneficiary);
      delete this.edit[beneficiary.id as string];
    } catch (e) {
      this.handleError(e);
    }
  }

  async deleteBeneficiary(id?: string): Promise<void> {
    if (!id) {
      return;
    }

    try {
      await this.beneficiaryService.delete(id);
      this.beneficiaries.splice(this.findPosition(id, this.beneficiaries), 1);
    } catch (e) {
      this.handleError(e);
    }
  }
}
