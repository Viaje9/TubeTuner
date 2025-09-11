import { Routes } from '@angular/router';
import { MenuComponent } from './views/menu/menu.component';
import { LocalVideoComponent } from './views/local-video/local-video.component';
import { AiSettingsComponent } from './views/ai-settings/ai-settings.component';
import { FavoritesComponent } from './views/favorites/favorites.component';
import { AiChatComponent } from './views/ai-chat/ai-chat.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: MenuComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'local-video', component: LocalVideoComponent },
  { path: 'ai-settings', component: AiSettingsComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'ai-chat', component: AiChatComponent },
  { path: '**', redirectTo: '' },
];
