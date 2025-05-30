import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
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
export class SidenavComponent implements OnInit {
  @Output() screenChange = new EventEmitter<string>();
  @Input() activeClassFromParent: string = '';

  currentUser: any = null;
  activepage: string = '';
  activeClass: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    
    // If mobile menu is clicked, use the activeClassFromParent
    if (this.activeClassFromParent) {
      this.activepage = this.activeClassFromParent;
      this.activeClass = this.activeClassFromParent;
    } else {
      // Default behavior based on user role
      this.activepage = this.currentUser?.role === 'admin' ? 'dashboard' : 'goldLoans';
      this.activeClass = this.activepage;
    }
    
    this.screenChange.emit(this.activepage);
  }

  changeScreen(screen: string) {
    if ((screen === 'dashboard' || screen === 'settings') && this.currentUser?.role !== 'admin') {
      return; // Don't change screen if user is not admin
    }
    this.activepage = screen;
    this.activeClass = screen;
    this.screenChange.emit(screen);
  }

  isActive(page: string): boolean {
    return this.activepage === page;
  }
}
