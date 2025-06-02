import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ToastService } from '../../services/toastr.service';
import { ControllersService } from '../../services/controllers.service';
import { GoldLoanService } from '../../services/gold-loan.service';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  styleUrls: ['./login.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  currentUser: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastService,
    private controllers: ControllersService,
    private authService: AuthService,
    private goldLoanService: GoldLoanService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    if(this.currentUser){
      this.controllers.LogoutAgent(this.currentUser,Number(this.currentUser.userId)).subscribe({
        next: (data) => {
          if (data) {
            this.authService.currentUserSubject.next(null);
            localStorage.removeItem('currentUser');
          }
        }
      })
    }
  }

  onSubmit() {

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
  
      const loginData = {
        username: email,
        password: password
      };
  
      this.controllers.LoginAgent(loginData).subscribe({
        next: (data) => {
          if (data) {
            this.toast.success('Welcome ' + data.name);
            this.authService.currentUserSubject.next(data);
            localStorage.setItem('currentUser', JSON.stringify(data));
            this.router.navigate(['/layout']);
          } else {
            this.toast.error('Invalid credentials');
            this.router.navigate(['/login']);
          }
        },
        error: (res) => {
          this.toast.warning(res.error.error);
          localStorage.removeItem('currentUser');
          this.authService.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        }
      });
  
    } else {
      this.toast.warning('Please fill in all required fields');
    }
  }
  

}
