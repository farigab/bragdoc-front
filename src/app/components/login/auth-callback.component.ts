import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  template: `<p>Finalizando login...</p>`
})
export class AuthCallbackComponent implements OnInit {

  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const token = new URLSearchParams(location.search).get('token');
    if (!token) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.auth.setToken(token);
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }
}
