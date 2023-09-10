import { Component, NgZone, inject } from '@angular/core';
import { CollectionViewModule } from '@nativescript-community/ui-collectionview/angular';
import { PokedexService } from './pokedex.service';
import { TitleCasePipe } from '@angular/common';
import { PokeList, Pokemon } from './pokemon.model';
import { firstValueFrom } from 'rxjs';
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
    <ActionBar tilte="NativeScript Pokedex"></ActionBar>
    <CollectionView (loadMoreItems)="loadMore()" [items]="pokemon" rowHeight="100">
      <ng-template let-pokemon="item">
        <GridLayout columns="100 *" (tap)="navigateTo(pokemon.pokeIndex)">
          <Label hlmH3 class="" column="1">{{ pokemon?.name | titlecase }}</Label>
          <ImageCacheIt [sharedTransitionTag]="'poke-image-' + pokemon.pokeIndex" height="100" [src]="pokemon?.image"></ImageCacheIt>
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
    NativeScriptRouterModule,
    ImageCacheItModule,
  ],
})
export class PokedexComponent {
  private pokedexService = inject(PokedexService);
  private router = inject(RouterExtensions);
  private zone = inject(NgZone);
  pokemon: PokeList = [];

  async ngOnInit() {
    this.pokemon = await firstValueFrom(this.pokedexService.getPokemon());
  }

  async loadMore() {
    const newPokemon = await firstValueFrom(
      this.pokedexService.getPokemon(this.pokemon.length)
    );

    this.pokemon = [...this.pokemon, ...newPokemon];
  }

  navigateTo2(index: number) {
    this.zone.run(() => {
      this.router.navigate([`pokemon/${index}`]);
    });
  }

  navigateTo(index: number) {
    const config: SharedTransitionConfig = {
      interactive: {
        dismiss: {
          finishThreshold: 0.3,
          percentFormula: (eventData) => {
            return (
              eventData.deltaX / (eventData.ios.view.bounds.size.width / 2)
            );
          },
        },
      },
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
