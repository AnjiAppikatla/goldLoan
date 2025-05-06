import { Component } from '@angular/core';
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

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;

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

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      this.controllers.GetAgentById(email, password).subscribe({
        next: (data) => {
          if (data) {
            const parsedData = JSON.parse(data);
            const user = parsedData[0];
      
            if (user) {
              this.authService.currentUserSubject.next(user);
              localStorage.setItem('currentUser', JSON.stringify(user));
              this.router.navigate(['/layout']);
            }
          } else {
            this.toast.error('Invalid credentials');
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.toast.error('Login failed. Please try again.');
          localStorage.removeItem('currentUser');
          this.authService.currentUserSubject.next(null);
        }
      });
    } else {
      this.toast.warning('Please fill in all required fields');
    }
  }

}
