import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  login!: string;
  pass!: string;
  loading = false;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private userService: UserService
  ) { }

  ngOnInit() {
    // this.userService.create('admin', 'Admin', 'admin')
  }

  async signIn(): Promise<void> {
    this.loading = true;
    try {
      await this.userService.auth(this.login, this.pass);
      this.router.navigate(['/admin'], { replaceUrl: true });
    } catch (e: any) {
      const message = e.msg || e;
      if (!e.msg) {
        console.error(e);
      }

      this.toastService.error(message);
    }
    this.loading = false;
  }
}
