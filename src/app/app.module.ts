import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  NativeScriptAnimationsModule,
  NativeScriptHttpClientModule,
  NativeScriptModule,
} from '@nativescript/angular';
import { GraphQLModule } from './graphql.module';
import { RxLet } from '@rx-angular/template/let';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PokemonDetailComponent } from './pokemon/pokemon-detail.component';
import { PokedexComponent } from './pokemon/pokedex.component';
import { PokemonService } from './services/pokemon.service';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    NativeScriptModule,
    NativeScriptHttpClientModule,
    NativeScriptAnimationsModule,
    GraphQLModule,
    AppRoutingModule,
    RxLet,
    PokemonDetailComponent,
    PokedexComponent,
  ],
  declarations: [AppComponent],
  providers: [PokemonService],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
