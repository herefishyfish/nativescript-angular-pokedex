import { TitleCasePipe } from "@angular/common";
import {
  Component,
  NO_ERRORS_SCHEMA,
  NgZone,
  inject,
  signal,
} from "@angular/core";
import {
  CollectionView,
  CollectionViewItemEventData,
} from "@nativescript-community/ui-collectionview";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import {
  NativeScriptCommonModule,
  NativeScriptRouterModule,
  RouterExtensions,
} from "@nativescript/angular";
import {
  LoadEventData,
  ObservableArray,
  PageTransition,
  Screen,
  SharedTransition,
  SharedTransitionConfig,
  SharedTransitionTagProperties,
  isIOS,
} from "@nativescript/core";
import { RxActionFactory } from "@rx-angular/state/actions";
import { RxLet } from "@rx-angular/template/let";
import { ImageCacheItModule } from "@triniwiz/nativescript-image-cache-it/angular";
import {
  BehaviorSubject,
  Subject,
  catchError,
  combineLatest,
  map,
  of,
  startWith,
  switchMap,
  take,
  tap,
} from "rxjs";
import { PokemonService } from "../../services/pokemon.service";
import { Pokemon } from "../../services/pokemon.models";
import { HlmButtonDirective } from "../../ui/button/hlm-button.directive";
import { BrnSeparatorComponent } from "../../ui/separator/brn-separator.component";
import { HlmSeparatorDirective } from "../../ui/separator/hlm-separator.directive";
import { HlmH1Directive } from "../../ui/typography/hlm-h1.directive";
import { HlmH3Directive } from "../../ui/typography/hlm-h3.directive";
import { PokemonPageCardComponent } from "./components/pokemon-card.component";

interface Actions {
  retry: void;
}

@Component({
  templateUrl: "./pokedex.page.html",
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
  providers: [RxActionFactory],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PokedexPageComponent {
  private pokemonService = inject(PokemonService);
  private router = inject(RouterExtensions);
  private zone = inject(NgZone);
  private collectionView: CollectionView;
  private factory = inject(RxActionFactory<Actions>);
  action = this.factory.create();

  pokemons = new ObservableArray<Pokemon>([]);
  displayMode = signal("fill");
  search$ = new BehaviorSubject("");
  errorTrigger$ = new Subject<void>();
  loading = false;

  get searchValue(): string {
    return this.search$.getValue();
  }
  set searchValue(value: string) {
    this.search$.next(value);
  }

  pokemon$ = this.action.retry$.pipe(
    startWith(null),
    switchMap(() =>
      combineLatest([
        this.search$,
        this.pokemonService.getPokemon().pipe(
          catchError((error) => {
            console.log("error", error);
            this.errorTrigger$.next();
            return of(null);
          })
        ),
      ])
    ),
    map(([searchValue, pokemon]) => {
      return pokemon?.filter((p) => {
        if (searchValue) {
          return (
            p.name.includes(searchValue.toLowerCase()) ||
            p.id.toString().includes(searchValue)
          );
        }
        return true;
      });
    })
  );

  ngOnInit() {
    this.pokemon$.subscribe((pokemons) => {
      this.pokemons.splice(0, this.pokemons.length, ...pokemons);
    });
  }

  onCollectionViewLoad(args: LoadEventData) {
    this.collectionView = args.object as CollectionView;
  }

  setDisplayMode(value) {
    this.displayMode.set(value);
    if (isIOS && this.collectionView) {
      this.zone.runOutsideAngular(() => {
        this.collectionView.requestLayout();
      });
    }
  }

  navigateTo(args: CollectionViewItemEventData) {
    const pokemon = this.pokemons.getItem(args.index);
    const config: SharedTransitionConfig = {
      pageEnd: {
        duration: 300,
      },
      pageReturn: {
        duration: 150,
      },
    };

    // prime the load before animating transition
    this.loading = true;
    this.pokemonService
      .getDetail(pokemon.id)
      .subscribe((pokemonDetails) => {
        this.pokemonService.activeDetail = pokemonDetails;
        this.loading = false;
        setTimeout(() => {
          // we navigate on next tick to ensure snapshotting doesn't snap the loader graphic
          this.router.navigate([`pokemon/${pokemon.id}`], {
            transition: SharedTransition.custom(new PageTransition(), config),
          });
        })
      });
  }
}
