import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule
  ],
})
export class SidenavComponent {
  @Output() screenChange = new EventEmitter<string>();

  currentUser: any = [];
  activepage: string = 'dashboard';

  constructor(
    private authService: AuthService 
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    if(this.currentUser?.role === 'admin') {  // Add safe navigation operator
      this.activepage = 'dashboard';
      this.screenChange.emit('dashboard');  // Emit initial screen
    } else {
      this.activepage = 'goldLoans';
      this.screenChange.emit('goldLoans');  // Emit initial screen
    }
  }

  

  changeScreen(screen: string) {
    this.activepage = screen;
    this.screenChange.emit(screen);
  }
}
