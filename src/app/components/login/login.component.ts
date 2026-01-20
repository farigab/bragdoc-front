import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="login-page">
      <h1>Entrar</h1>
      <p-button label="Entrar com GitHub" (click)="login()"></p-button>
    </div>
  `,
  styles: [`.login-page { display:flex; flex-direction:column; gap:16px; align-items:center; justify-content:center; height:60vh }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'login-component' }
})
export class LoginComponent {
  private readonly auth = inject(AuthService);

  login() {
    this.auth.loginWithGithub();
  }
}
