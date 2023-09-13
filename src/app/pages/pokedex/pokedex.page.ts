import {
  Component,
  NgZone,
  inject,
  NO_ERRORS_SCHEMA,
  signal,
} from "@angular/core";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { PokemonService } from "../../services/pokemon.service";
import { Pokemon } from "../../services/gql/get-pokemon.gql";
import { TitleCasePipe } from "@angular/common";
import {
  BehaviorSubject,
  Observable,
  map,
  of,
  switchMap,
} from "rxjs";
import { BrnSeparatorComponent } from "../../ui/separator/brn-separator.component";
import { HlmSeparatorDirective } from "../../ui/separator/hlm-separator.directive";
import { HlmH3Directive } from "../../ui/typography/hlm-h3.directive";
import {
  NativeScriptCommonModule,
  NativeScriptRouterModule,
  RouterExtensions,
} from "@nativescript/angular";
import { ImageCacheItModule } from "@triniwiz/nativescript-image-cache-it/angular";
import {
  PageTransition,
  SharedTransition,
  SharedTransitionConfig,
  Screen,
} from "@nativescript/core";
import { RxLet } from "@rx-angular/template/let";
import { HlmH1Directive } from "../../ui/typography/hlm-h1.directive";
import { HlmButtonDirective } from "../../ui/button/hlm-button.directive";
import { PokemonPageCardComponent } from "./components/pokemon-card.component";

@Component({
  template: `
    <GridLayout rows="auto *">
      <StackLayout row="0" class="p-2 text-primary">
        <FlexboxLayout class="mb-1" justifyContent="space-between">
          <Label hlmH1 class="text-lg text-primary">NativeScript Pokedex</Label>
          <StackLayout orientation="horizontal">
            <Button text="&#xf0c9;" hlmBtn variant="outline" style="android-elevation: -4;" (tap)="setDisplayMode('fill')" class="fa m-0 mr-1 p-0 w-10 h-10"></Button>
            <Button text="&#xf009;" hlmBtn variant="outline" style="android-elevation: -4;" (tap)="setDisplayMode('grid')" class="fa m-0 p-0 w-10 h-10"></Button>
          </StackLayout>
        </FlexboxLayout>
        <TextField
          (textChange)="searchValue = $event.value"
          class="border-border border rounded-md px-2"
          hint="Search Pokemon"
        ></TextField>
      </StackLayout>
      <ng-container *rxLet="pokemon$; let pokemon; suspense: suspense">
        <CollectionView
          row="1"
          [items]="pokemon"
          rowHeight="120"
          [colWidth]="displayMode() === 'fill' ? '100%' : '50%'"
        >
          <ng-template let-pokemon="item">
            <pokemon-card [pokemon]="pokemon" (tap)="navigateTo(pokemon.id)" />
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
    PokemonPageCardComponent,
    TitleCasePipe,
    HlmH1Directive,
    HlmH3Directive,
    HlmButtonDirective,
    BrnSeparatorComponent,
    HlmSeparatorDirective,
    NativeScriptRouterModule,
    ImageCacheItModule,
    RxLet,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PokedexPageComponent {
  private pokemonService = inject(PokemonService);
  private router = inject(RouterExtensions);
  private zone = inject(NgZone);
  displayMode = signal("fill");
  pokemon$: Observable<Pokemon[]>;
  search$ = new BehaviorSubject("");

  get searchValue(): string {
    return this.search$.getValue();
  }
  set searchValue(value: string) {
    this.search$.next(value);
  }

  async ngOnInit() {
    this.pokemon$ = this.search$.pipe(
      switchMap((searchValue) => {
        // return this.pokemonService.getPokemon()
        return of([
          {
            id: 1,
            name: "bulbasaur",
            image:
              "https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/thumbnails/001.png",
            sprite:
              "https://img.pokemondb.net/sprites/sun-moon/normal/pikachu-f.png",
          },
          {
            id: 2,
            name: "ivysaur",
            image:
              "https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/thumbnails/002.png",
          },
          {
            id: 3,
            name: "venusaur",
            image:
              "https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/thumbnails/003.png",
          },
          {
            id: 4,
            name: "charmander",
            image:
              "https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/thumbnails/004.png",
          },
          {
            id: 5,
            name: "charmeleon",
            image:
              "https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/thumbnails/005.png",
          },
        ]).pipe(
          map((pokemon) => {
            return pokemon.filter(
              (p) =>
                p.name.includes(searchValue.toLowerCase()) ||
                p.id.toString().includes(searchValue)
            );
          })
        );
      })
    );
  }

  setDisplayMode(value) {
    this.displayMode.set(value)
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
