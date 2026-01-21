import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  template: `<p>Finalizando login...</p>`
})
export class AuthCallbackComponent implements OnInit {

  private router = inject(Router);

  ngOnInit(): void {
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }
}
