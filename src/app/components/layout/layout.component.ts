import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DrawerModule } from 'primeng/drawer';

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
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Achievements', icon: 'pi pi-star', routerLink: '/achievements' },
    { label: 'Timeline', icon: 'pi pi-clock', routerLink: '/timeline' },
    { label: 'Reports', icon: 'pi pi-chart-bar', routerLink: '/reports' },
    { label: 'GitHub Import', icon: 'pi pi-upload', routerLink: '/github-import' }
  ];

  constructor() {
    this.auth.loadUser();
  }

  protected toggleSidebar(): void {
    this.sidebarVisible.update(v => !v);
  }

  protected login(): void {
    this.auth.loginWithGithub();
  }

  protected logout(): void {
    this.auth.logout();
  }
}
