import { Component, NgZone, inject, NO_ERRORS_SCHEMA } from '@angular/core';
import { CollectionViewModule } from '@nativescript-community/ui-collectionview/angular';
import { PokemonService } from '../services/pokemon.service';
import { Pokemon } from '../services/gql/get-pokemon.gql';
import { TitleCasePipe } from '@angular/common';
import { Observable, firstValueFrom } from 'rxjs';
import { BrnSeparatorComponent } from '../ui/separator/brn-separator.component';
import { HlmSeparatorDirective } from '../ui/separator/hlm-separator.directive';
import { HlmH3Directive } from '../ui/typography/hlm-h3.directive';
import {
  NativeScriptCommonModule,
  NativeScriptRouterModule,
  RouterExtensions,
} from '@nativescript/angular';
import { ImageCacheItModule } from '@triniwiz/nativescript-image-cache-it/angular';
import {
  PageTransition,
  SharedTransition,
  SharedTransitionConfig,
  Screen,
} from '@nativescript/core';
import { RxLet } from '@rx-angular/template/let';
import { HlmH1Directive } from '../ui/typography/hlm-h1.directive';

@Component({
  template: `
    <GridLayout rows="auto *">
      <StackLayout row="0" class="p-2 text-primary border-border border-b-2">
        <Label hlmH1 class="text-2xl text-primary">NativeScript Pokedex</Label>
      </StackLayout>
      <ng-container *rxLet="pokemon$; let pokemon; suspense: suspense;">
        <CollectionView row="1" [items]="pokemon" rowHeight="100">
          <ng-template let-pokemon="item">
            <GridLayout rows="auto, auto" columns="100 *" class="border-border border-b" (tap)="navigateTo(pokemon.id)">
              <Label hlmH3 class="text-primary" column="1">{{ pokemon?.name | titlecase }}</Label>
              <ImageCacheIt class="px-1" [sharedTransitionTag]="'poke-image-' + pokemon.id" height="100" [src]="pokemon?.image"></ImageCacheIt>
            </GridLayout>
          </ng-template>
        </CollectionView>
      </ng-container>
    </GridLayout>

    <ng-template #suspense>
      <Label row="1">Loading...</Label>
    </ng-template>
  `,
  standalone: true,
  imports: [
    NativeScriptCommonModule,
    CollectionViewModule,
    TitleCasePipe,
    HlmH1Directive,
    HlmH3Directive,
    BrnSeparatorComponent,
    HlmSeparatorDirective,
    NativeScriptRouterModule,
    ImageCacheItModule,
    RxLet,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PokedexComponent {
  private pokemonService = inject(PokemonService);
  private router = inject(RouterExtensions);
  private zone = inject(NgZone);
  pokemon$: Observable<Pokemon[]>;

  async ngOnInit() {
    this.pokemon$ = this.pokemonService.getPokemon();
  }

  async loadMore() {
    // const newPokemon = await firstValueFrom(
    //   this.pokemonService.getPokemon(this.pokemon.length)
    // );

    // this.pokemon = [...this.pokemon, ...newPokemon];
  }
  
  navigateTo(index: number) {
    const config: SharedTransitionConfig = {
      pageStart: {
        x: -Screen.mainScreen.widthDIPs,
        y: 0,
      },
      pageEnd: {
        duration: 250,
        spring: { tension: 60, friction: 8, mass: 4 },
      },
      pageReturn: {
        duration: 150,
      },
    };

    this.zone.run(() => {
      this.router.navigate([`pokemon/${index}`], {
        transition: SharedTransition.custom(new PageTransition(), config),
      });
    });
  }
}
