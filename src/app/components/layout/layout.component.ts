import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { RippleModule } from 'primeng/ripple';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    AvatarModule,
    DrawerModule,
    RippleModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'layout-wrapper' }
})
export class LayoutComponent {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;

  constructor() {
  }

  protected logout(): void {
    this.auth.logout();
  }

  protected login(): void {
    this.auth.loginWithGithub();
  }
}
