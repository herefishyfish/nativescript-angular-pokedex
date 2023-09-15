import { TitleCasePipe } from "@angular/common";
import {
  Component,
  NO_ERRORS_SCHEMA,
  NgZone,
  computed,
  inject,
  signal,
} from "@angular/core";
import { CollectionView } from "@nativescript-community/ui-collectionview";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import {
  NativeScriptCommonModule,
  NativeScriptRouterModule,
  RouterExtensions,
} from "@nativescript/angular";
import {
  LoadEventData,
  PageTransition,
  Screen,
  SharedTransition,
  SharedTransitionConfig,
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
  tap,
} from "rxjs";
import { PokemonService } from "../../services/pokemon.service";
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

  displayMode = signal("fill");
  displayWidth = computed(() => {
    return this.displayMode() === 'fill' ? '100%' : '50%';
  });

  get searchValue(): string {
    return this.search$.getValue();
  }
  set searchValue(value: string) {
    this.search$.next(value);
  }

  search$ = new BehaviorSubject("");
  errorTrigger$ = new Subject<void>();
  pokemon$ = this.action.retry$.pipe(
    startWith(null),
    switchMap(() =>
      combineLatest([
        this.search$,
        this.pokemonService.getPokemon().pipe(
          catchError((error) => {
            console.log('error', error);
            this.errorTrigger$.next();
            return of(null);
          })
        ),
      ])
    ),
    map(([searchValue, pokemon]) => {
      return pokemon?.filter(
        (p) =>
          p.name.includes(searchValue.toLowerCase()) ||
          p.id.toString().includes(searchValue)
      );
    }),
  );

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

  navigateTo(index: number) {
    const config: SharedTransitionConfig = {
      pageStart: {
        x: -Screen.mainScreen.widthDIPs,
        y: 0,
      },
      pageEnd: {
        duration: 250,
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
