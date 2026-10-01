import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component của POS Management Application.
 *
 * Component này chỉ là shell container — logic thực sự nằm ở
 * các feature components (Login, Dashboard, Layout...).
 * RouterOutlet sẽ render component tương ứng route hiện tại.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
    }
  `],
})
export class AppComponent {
  title = 'POS Management System';
}
