import { Component, OnInit, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  template: `<p>Finalizando login...</p>`
})
export class AuthCallbackComponent implements OnInit {

  private router = inject(Router);
  private auth = inject(AuthService);

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (user) {
        this.router.navigate(['/github-import'], { replaceUrl: true });
      }
    });
  }

  ngOnInit(): void {
    this.auth.loadUser();
  }
}
