import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MenuItem } from 'primeng/api';
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
  protected readonly sidebarVisible = signal(false);

  protected readonly menuItems: readonly MenuItem[] = [
    { label: 'GitHub Import', icon: 'pi pi-upload', routerLink: '/github-import' },
    { label: 'Reports', icon: 'pi pi-chart-bar', routerLink: '/reports' }
  ];

  constructor() {
    // loadUser moved to app.component.ts
  }

  protected toggleSidebar(): void {
    this.sidebarVisible.update(v => !v);
  }

  protected logout(): void {
    this.auth.logout();
  }

  protected login(): void {
    this.auth.loginWithGithub();
  }
}
