import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  NativeScriptHttpClientModule,
  NativeScriptModule,
} from '@nativescript/angular';
import { RxLet } from '@rx-angular/template/let';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PokemonDetailComponent } from './pokemon/pokemon-detail.component';
import { PokedexService } from './pokemon/pokedex.service';
import { PokedexComponent } from './pokemon/pokedex.component';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    NativeScriptModule,
    NativeScriptHttpClientModule,
    AppRoutingModule,
    RxLet,
    PokemonDetailComponent,
    PokedexComponent,
  ],
  declarations: [AppComponent],
  providers: [PokedexService],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
