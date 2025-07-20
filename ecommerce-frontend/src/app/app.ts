// app.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { 
  FooterComponent, 
  NavbarComponent, 
  LoadingSpinnerComponent, 
  ToastComponent 
} from './shared/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    ToastComponent,
  ],
  templateUrl: './app.html',
})
export class AppComponent {
  title = 'E-Commerce Store';
}
