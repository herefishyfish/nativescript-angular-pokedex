import { NgFor, TitleCasePipe, JsonPipe } from "@angular/common";
import {
  Component,
  NO_ERRORS_SCHEMA,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Pager } from "@nativescript-community/ui-pager";
import { PagerModule } from "@nativescript-community/ui-pager/angular";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { LoadEventData, Page } from "@nativescript/core";
import { RxFor } from "@rx-angular/template/for";
import { RxLet } from "@rx-angular/template/let";
import { ImageCacheItModule } from "@triniwiz/nativescript-image-cache-it/angular";
import { BehaviorSubject, sampleTime, startWith, switchMap } from "rxjs";
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
  template: `
    <GridLayout
      rows="auto auto auto *"
      columns="70* 30*"
      class="pb-2"
      *rxLet="pokemon$; let pokemon; suspense: suspense; error: error"
    >
      <StackLayout colSpan="2" class="pb-1 pt-2 px-4" orientation="horizontal">
        <Label hlmH1 class="text-primary mr-1">{{
          pokemon?.name | titlecase
        }}</Label>
        <Label hlmH2 class="text-muted-foreground">#{{ pokemon?.id }}</Label>
      </StackLayout>

      <StackLayout
        row="1"
        colSpan="2"
        class="pb-1 px-4"
        orientation="horizontal"
      >
        <ng-container *ngFor="let type of pokemon.types">
          <Label class="mr-1" hlmBadge [type]="type">{{
            type | titlecase
          }}</Label>
        </ng-container>
      </StackLayout>

      <ImageCacheIt
        [sharedTransitionTag]="'poke-image-' + id"
        [src]="pokemon.image"
        row="2"
        class="m-2"
      ></ImageCacheIt>

      <StackLayout
        *rxLet="currentIndex$ as index"
        row="2"
        col="1"
        class="mr-2 my-2"
        orientation="vertical"
        hlmTabsList
      >
        <Button
          hlmTabsTrigger
          *ngFor="
            let tab of ['Stats', 'Details', 'Abilities', 'Moves', 'Evolution'];
            let i = index
          "
          width="120"
          color="{{ index | colorTransition : i : '#fff' : 'grey' }}"
          backgroundColor="{{ index | colorTransition : i : 'black' : '#fff' }}"
          (tap)="onSelectedIndexChanged(i)"
          >{{ tab }}</Button
        >
      </StackLayout>

      <Pager peaking="8" row="3" colSpan="2" (loaded)="onPagerLoaded($event)">
        <pokemon-stats
          hlmCard
          class="p-4 mx-2 my-1"
          [pokemon]="pokemon"
          *pagerItem
        />
        <pokemon-details
          hlmCard
          class="p-4 mx-2 my-1"
          [pokemon]="pokemon"
          *pagerItem
        />
        <pokemon-abilities
          hlmCard
          class="p-4 mx-2 my-1"
          [pokemon]="pokemon"
          *pagerItem
        />
        <pokemon-moves
          hlmCard
          class="py-2 mx-2 my-1"
          [pokemon]="pokemon"
          *pagerItem
        />

        <StackLayout hlmCard class="p-4 mx-2 my-1"  *pagerItem>
          <ScrollView>
            <pokemon-evolutions [pokemon]="pokemon" />
          </ScrollView>
        </StackLayout>
      </Pager>
    </GridLayout>

    <ng-template #suspense>
      <GridLayout rows="*" columns="*">
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
      <GridLayout rows="* auto *" columns="*">
        <Label hlmH3 row="1" class="text-center"
          >Could not get pokemon! 🫤</Label
        >
        <ImageCacheIt
          src="https://static.thenounproject.com/png/561604-200.png"
          height="280"
          width="280"
        ></ImageCacheIt>
        <Label class="text-center mt-8 pt-8 text-7xl text-primary" hlmH1
          >???</Label
        >
      </GridLayout>
    </ng-template>
  `,
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
  private pokedexService = inject(PokemonService);
  private route = inject(ActivatedRoute);
  private page = inject(Page);
  private pager: Pager;
  private _scrollListener;
  private _currentIndex = new BehaviorSubject(0);
  currentIndex$ = this._currentIndex.pipe(sampleTime(1000 / 60), startWith(0));
  id: number;

  ngOnInit() {
    // this.page.enableSwipeBackNavigation = false;
    this.page.actionBarHidden = true;
  }

  pokemon$ = this.route.params.pipe(
    switchMap((params) => {
      this.id = +params["id"];
      return this.pokedexService.getPokemonDetails(this.id);
    })
  );

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
}
