import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LayoutComponent } from './components/layout/layout.component';

@Component({
    selector: 'app-root',
    imports: [LayoutComponent],
    template: '<app-layout></app-layout>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent { }
