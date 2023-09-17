import { NgFor, TitleCasePipe, JsonPipe } from "@angular/common";
import {
  Component,
  NO_ERRORS_SCHEMA,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { Pager } from "@nativescript-community/ui-pager";
import { PagerModule } from "@nativescript-community/ui-pager/angular";
import {
  NativeScriptCommonModule,
  RouterExtensions,
} from "@nativescript/angular";
import { LoadEventData, Page } from "@nativescript/core";
import { RxLet } from "@rx-angular/template/let";
import { ImageCacheItModule } from "@triniwiz/nativescript-image-cache-it/angular";
import {
  BehaviorSubject,
  sampleTime,
  startWith,
} from "rxjs";
import { HlmBadgeDirective } from "../../ui/badge/hlm-badge.directive";
import { HlmCardDirective } from "../../ui/card/hlm-card.directive";
import { ColorTransitionPipe } from "../../ui/tabs/color-transition.pipe";
import { HlmTabsListDirective } from "../../ui/tabs/hlm-tabs-list.directive";
import { HlmTabsTriggerDirective } from "../../ui/tabs/hlm-tabs-trigger.directive";
import { HlmH1Directive } from "../../ui/typography/hlm-h1.directive";
import { HlmH2Directive } from "../../ui/typography/hlm-h2.directive";
import { HlmH3Directive } from "../../ui/typography/hlm-h3.directive";
import { HlmH4Directive } from "../../ui/typography/hlm-h4.directive";
import { HlmPDirective } from "../../ui/typography/hlm-p.directive";
import { BrnProgressComponent } from "../../ui/progress/brn-progress.component";
import { PokemonService } from "../../services/pokemon.service";
import { PokemonAbilitiesComponent } from "./components/abilities.component";
import { PokemonMovesComponent } from "./components/moves.component";
import { PokemonStatsComponent } from "./components/stats.component";
import { PokemonDetailsComponent } from "./components/details.component";
import { PokemonEvolutionsComponent } from "./components/evolutions.component";

@Component({
  templateUrl: "./pokemon.page.html",
  standalone: true,
  imports: [
    NativeScriptCommonModule,
    PagerModule,
    ImageCacheItModule,
    PokemonAbilitiesComponent,
    PokemonMovesComponent,
    PokemonDetailsComponent,
    PokemonStatsComponent,
    PokemonEvolutionsComponent,
    HlmCardDirective,
    HlmH1Directive,
    HlmH2Directive,
    HlmH3Directive,
    HlmH4Directive,
    HlmPDirective,
    HlmBadgeDirective,
    HlmTabsListDirective,
    HlmTabsTriggerDirective,
    BrnProgressComponent,
    JsonPipe,
    TitleCasePipe,
    ColorTransitionPipe,
    RxLet,
    NgFor,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PokemonDetailComponent implements OnInit, OnDestroy {
  private pokemonService = inject(PokemonService);
  private router = inject(RouterExtensions);
  private page = inject(Page);
  private pager: Pager;
  private _scrollListener;
  private _currentIndex = new BehaviorSubject(0);
  currentIndex$ = this._currentIndex.pipe(sampleTime(1000 / 60), startWith(0));
  pokemon;

  ngOnInit() {
    this.page.enableSwipeBackNavigation = false;
    this.page.actionBarHidden = true;
    this.pokemon = this.pokemonService.activeDetail;
  }

  back() {
    this.router.back();
  }

  ngOnDestroy(): void {
    this._scrollListener?.off();
  }

  onPagerLoaded(event: LoadEventData) {
    this.pager = event.object as Pager;

    this._scrollListener = this.pager.on("scroll", (args) => {
      this._currentIndex.next(args["currentPosition"]);
    });
  }

  onSelectedIndexChanged(index: number) {
    this.pager.selectedIndex = index;
  }

  onEvolutionChange(id: number) {
    this.pokemonService.getDetail(id).subscribe((pokemonDetails) => {
      this.pokemonService.activeDetail = this.pokemon = pokemonDetails;
      this.router.navigate(["/pokemon", id]);
      this.pager.selectedIndex = 0;
    });
  }
}
