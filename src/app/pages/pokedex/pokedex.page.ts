import { TitleCasePipe } from "@angular/common";
import {
  Component,
  NO_ERRORS_SCHEMA,
  NgZone,
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
  Observable,
  Subject,
  catchError,
  combineLatest,
  map,
  of,
  startWith,
  switchMap,
  tap,
  throwError,
} from "rxjs";
import { Pokemon } from "../../services/gql/get-pokemon.gql";
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
  template: `
    <GridLayout rows="auto *">
      <StackLayout row="0" class="p-2 text-primary dark:text-white">
        <FlexboxLayout class="mb-1" justifyContent="space-between">
          <Label hlmH1 class="text-lg">NativeScript Pokedex</Label>
          <StackLayout orientation="horizontal">
            <Button
              text="&#xf0c9;"
              hlmBtn
              variant="outline"
              style="android-elevation: -4;"
              (tap)="setDisplayMode('fill')"
              class="fa m-0 mr-1 p-0 w-10 h-10"
            ></Button>
            <Button
              text="&#xf009;"
              hlmBtn
              variant="outline"
              style="android-elevation: -4;"
              (tap)="setDisplayMode('grid')"
              class="fa m-0 p-0 w-10 h-10"
            ></Button>
          </StackLayout>
        </FlexboxLayout>
        <TextField
          (textChange)="searchValue = $event.value"
          class="border-border border rounded-md p-2 text-primary dark:text-white"
          hint="Search Pokemon"
        ></TextField>
      </StackLayout>
      <ng-container
        *rxLet="
          pokemon$;
          let pokemon;
          suspense: suspense;
          suspenseTrigger: suspenseTrigger$;
          error: error;
          errorTrigger: errorTrigger$
        "
      >
        <CollectionView
          row="1"
          rowHeight="120"
          [items]="pokemon"
          (loaded)="onCollectionViewLoad($event)"
          [colWidth]="displayMode() === 'fill' ? '100%' : '50%'"
        >
          <ng-template let-pokemon="item">
            <pokemon-card [pokemon]="pokemon" (tap)="navigateTo(pokemon.id)" />
          </ng-template>
        </CollectionView>
      </ng-container>
    </GridLayout>

    <ng-template #suspense>
      <GridLayout row="1" rows="*" columns="*">
        <ImageCacheIt
          src="https://cdn-icons-png.flaticon.com/256/744/744104.png"
          height="60"
          width="60"
        ></ImageCacheIt>
        <ActivityIndicator
          class="text-primary"
          height="100"
          width="100"
          busy="true"
        />
      </GridLayout>
    </ng-template>

    <ng-template #error>
      <StackLayout class="p-4" row="1">
        <Label>Something went wrong</Label>
        <Button hlmBtn (tap)="action.retry()">Retry</Button>
      </StackLayout>
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
  pokemon$: Observable<Pokemon[] | null>;
  search$ = new BehaviorSubject("");
  errorTrigger$ = new Subject<void>();
  suspenseTrigger$ = new Subject<void>();

  get searchValue(): string {
    return this.search$.getValue();
  }
  set searchValue(value: string) {
    this.search$.next(value);
  }

  async ngOnInit() {
    this.pokemon$ = this.action.retry$.pipe(
      tap(() => {
        this.suspenseTrigger$.next();
      }),
      startWith(null),
      switchMap(() =>
        combineLatest([
          this.search$,
          this.pokemonService.getPokemon().pipe(
            catchError((error) => {
              console.log(error);
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
      tap((r) => {
        if (!r) {
          this.errorTrigger$.next();
        }
      })
    );
  }

  onCollectionViewLoad(args: LoadEventData) {
    this.collectionView = args.object as CollectionView;
  }

  setDisplayMode(value) {
    this.zone.runOutsideAngular(() => {
      this.displayMode.set(value);
      if (isIOS && this.collectionView) {
        this.collectionView.requestLayout();
      }
    });
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
