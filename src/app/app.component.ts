import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, LayoutComponent],
    template: `
      @if (auth.user()) {
        <app-layout></app-layout>
      } @else {
        <router-outlet></router-outlet>
      }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
    protected readonly auth = inject(AuthService);

    constructor() {
        this.auth.loadUser();
    }
}
