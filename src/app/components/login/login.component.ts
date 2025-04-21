import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

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
  // Remove separate form controls since we're using FormGroup
  loginForm: FormGroup;
  
  private credentials = [
    { email: 'admin@goldloan.com', password: 'admin123' },
    { email: 'agent@goldloan.com', password: 'agent123' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.router.navigate(['/dashboard']);
    console.log('Form submitted', this.loginForm.value); // Add logging
    
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      const isValid = this.credentials.some(
        cred => cred.email === email && cred.password === password
      );

      if (isValid) {
        this.router.navigate(['/layout']);
      } else {
        alert('Invalid credentials');
      }
    } else {
      console.log('Form is invalid', this.loginForm.errors); // Add error logging
    }
  }
}
