import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-personalloans',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './personalloans.component.html',
  styleUrl: './personalloans.component.scss'
})
export class PersonalloansComponent {
}
