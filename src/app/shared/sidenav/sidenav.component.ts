import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'], // Add the styleshee
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

  activepage: string = 'dashboard';

  changeScreen(screen: string) {
    this.activepage = screen;
    this.screenChange.emit(screen);
  }
}
