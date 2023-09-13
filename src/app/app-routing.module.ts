import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';
import { PokemonDetailComponent } from './pages/pokemon/pokemon.page';
import { PokedexPageComponent } from './pages/pokedex/pokedex.page';

const routes: Routes = [
  { path: '', redirectTo: '/pokemon', pathMatch: 'full' },
  { path: 'pokemon', component: PokedexPageComponent },
  { path: 'pokemon/:id', component: PokemonDetailComponent },
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}
