import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppStateService } from './state/app-state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular';
  readonly state = inject(AppStateService);

  setModel(model: string) {
    this.state.setAiConfig({ model });
  }

  addDemoMessage() {
    this.state.addMessage({ role: 'user', content: 'Hello from Angular Signals!' });
  }
}
