import { Component, NgZone, inject } from '@angular/core';
import { CollectionViewModule } from '@nativescript-community/ui-collectionview/angular';
import { PokemonService } from '../services/pokemon.service';
import { Pokemon } from '../services/gql/get-pokemon.gql';
import { TitleCasePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
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

@Component({
  template: `
    <ActionBar class="bg-background text-primary" title="NativeScript Pokedex">
    </ActionBar>
    <CollectionView (loadMoreItems)="loadMore()" [items]="pokemon" rowHeight="100">
      <ng-template let-pokemon="item">
        <GridLayout rows="auto, auto" columns="100 *" class="border-border border-b" (tap)="navigateTo(pokemon.id)">
          <Label hlmH3 class="text-primary" column="1">{{ pokemon?.name | titlecase }}</Label>
          <ImageCacheIt [sharedTransitionTag]="'poke-image-' + pokemon.id" height="100" [src]="pokemon?.image"></ImageCacheIt>
        </GridLayout>
      </ng-template>
    </CollectionView>
  `,
  standalone: true,
  imports: [
    NativeScriptCommonModule,
    CollectionViewModule,
    TitleCasePipe,
    HlmH3Directive,
    BrnSeparatorComponent,
    HlmSeparatorDirective,
    NativeScriptRouterModule,
    ImageCacheItModule,
  ],
})
export class PokedexComponent {
  private pokemonService = inject(PokemonService);
  private router = inject(RouterExtensions);
  private zone = inject(NgZone);
  pokemon: Pokemon[] = [];

  async ngOnInit() {
    this.pokemon = await firstValueFrom(this.pokemonService.getPokemon(0));
  }

  async loadMore() {
    const newPokemon = await firstValueFrom(
      this.pokemonService.getPokemon(this.pokemon.length)
    );

    this.pokemon = [...this.pokemon, ...newPokemon];
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
