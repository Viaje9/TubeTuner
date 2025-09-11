import { Component, inject } from '@angular/core';
import { FavoritesService } from '../../app/state/favorites.service';
import { NgFor, DatePipe } from '@angular/common';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [NgFor, DatePipe],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent {
  readonly fav = inject(FavoritesService);
  clear() { this.fav.clear(); }
  remove(i: number) { this.fav.removeByIndex(i); }
}

