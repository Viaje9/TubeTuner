import { Routes } from '@angular/router';
import { MenuComponent } from './views/menu/menu.component';
import { LocalVideoComponent } from './views/local-video/local-video.component';
import { AiSettingsComponent } from './views/ai-settings/ai-settings.component';
import { VideoListComponent } from './views/video-list/video-list.component';
import { VideoDetailComponent } from './views/video-detail/video-detail.component';
import { VideoResolver } from './resolvers/video.resolver';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: MenuComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'video-list', component: VideoListComponent },
  { path: 'video/:id', component: VideoDetailComponent },
  { path: 'local-video', component: LocalVideoComponent, resolve: { video: VideoResolver } },
  { path: 'ai-settings', component: AiSettingsComponent },
  { path: '**', redirectTo: '' },
];
