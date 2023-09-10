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
import { RxPush } from "@rx-angular/template/push";
import { ImageCacheItModule } from "@triniwiz/nativescript-image-cache-it/angular";
import { BehaviorSubject, sampleTime, startWith, switchMap, tap } from "rxjs";
import { HlmBadgeDirective } from "../ui/badge/hlm-badge.directive";
import { HlmCardHeaderDirective } from "../ui/card/hlm-card-header.directive";
import { HlmCardTitleDirective } from "../ui/card/hlm-card-title.directive";
import { HlmCardDirective } from "../ui/card/hlm-card.directive";
import { ColorTransitionPipe } from "../ui/tabs/color-transition.pipe";
import { HlmTabsListDirective } from "../ui/tabs/hlm-tabs-list.directive";
import { HlmTabsTriggerDirective } from "../ui/tabs/hlm-tabs-trigger.directive";
import { HlmH1Directive } from "../ui/typography/hlm-h1.directive";
import { HlmH2Directive } from "../ui/typography/hlm-h2.directive";
import { HlmPDirective } from "../ui/typography/hlm-p.directive";
import { PokedexService } from "./pokedex.service";

@Component({
  template: `
    <GridLayout
      rows="auto auto auto *"
      columns="* auto"
      *rxLet="pokemon$; let pokemon"
    >
      <StackLayout colSpan="2" class="pb-1 pt-2 px-2" orientation="horizontal">
        <Label hlmH1 class="text-primary mr-1">{{ title | titlecase }}</Label>
        <Label hlmH2>#{{ id }}</Label>
      </StackLayout>

      <StackLayout row="1" colSpan="2" class="pb-1 px-2" orientation="horizontal">
        <ng-container *rxFor="let type of pokemon.types">
          <Label class="mr-1" hlmBadge [type]="type.type.name">{{
            type.type.name | titlecase
          }}</Label>
        </ng-container>
      </StackLayout>

      <ImageCacheIt
        [sharedTransitionTag]="'poke-image-' + id"
        [src]="imgUrl"
        row="2"
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
            let name of ['Stats', 'Details', 'Abilities', 'Moves', 'Evolution'];
            let i = index
          "
          width="120"
          color="{{ index | colorTransition : i : '#fff' : 'grey' }}"
          backgroundColor="{{ index | colorTransition : i : 'black' : '#fff' }}"
          (tap)="onSelectedIndexChanged(i)"
          >{{ name }}</Button
        >
      </StackLayout>

      <Pager peaking="8" spacing="4" row="3" colSpan="2" (loaded)="onPagerLoaded($event)">
        <StackLayout hlmCard class="p-4" *pagerItem>
          <!-- Stats -->
          <StackLayout orientation="horizontal">
            <StackLayout class="border-border border-r pr-2">
              <Label hlmP>Height</Label>
              <Label hlmH2>{{ pokemon.height | number : ".2" }} m </Label>
            </StackLayout>
            <StackLayout class="ml-2">
              <Label hlmP>Weight</Label>
              <Label hlmH2>{{ pokemon.weight | number : ".2" }} kg </Label>
            </StackLayout>
          </StackLayout>
          <ng-container *rxFor="let stat of pokemon.stats">
            <Label
              >{{ stat.stat.name | titlecase }} : {{ stat.base_stat }}</Label
            >
          </ng-container>
        </StackLayout>
        <StackLayout hlmCard class="p-4" *pagerItem>
          <!-- Details -->
          <Label hlmP>Base Experience</Label>
          <Label hlmH2>{{ pokemon.base_experience }}</Label>
        </StackLayout>
        <StackLayout hlmCard class="p-4" *pagerItem>
          <Label hlmP>Abilities</Label>
          <ng-container *rxFor="let ability of pokemon.abilities">
            <Label>{{ ability.ability.name | titlecase }}</Label>
          </ng-container>
        </StackLayout>
        <StackLayout hlmCard class="p-4" *pagerItem>
          <Label hlmP>Base Experience</Label>
          <Label hlmH2>{{ pokemon.base_experience }}</Label>
        </StackLayout>
        <StackLayout hlmCard class="p-4" *pagerItem>
          <Label hlmP>Base Experience</Label>
          <Label hlmH2>{{ pokemon.base_experience }}</Label>
        </StackLayout>
      </Pager>
    </GridLayout>

    <ng-template #suspense>
      <GridLayout rows="*" columns="*">
        <ActivityIndicator height="100" width="100" busy="true" />
      </GridLayout>
    </ng-template>
    <ng-template #error>
      <StackLayout>
        <Label>Could not get pokemon! 🫤</Label>
      </StackLayout>
    </ng-template>
  `,
  standalone: true,
  imports: [
    NativeScriptCommonModule,
    PagerModule,
    ImageCacheItModule,
    HlmCardDirective,
    HlmCardHeaderDirective,
    HlmCardTitleDirective,
    HlmH1Directive,
    HlmH2Directive,
    HlmPDirective,
    HlmBadgeDirective,
    HlmTabsListDirective,
    HlmTabsTriggerDirective,
    JsonPipe,
    TitleCasePipe,
    ColorTransitionPipe,
    RxPush,
    RxFor,
    RxLet,
    NgFor,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PokemonDetailComponent implements OnInit, OnDestroy {
  private pokedexService = inject(PokedexService);
  private route = inject(ActivatedRoute);
  private page = inject(Page);
  private pager: Pager;
  private _scrollListener;
  private _currentIndex = new BehaviorSubject(0);
  currentIndex$ = this._currentIndex.pipe(sampleTime(1000 / 60), startWith(0));
  imgUrl = "";
  title = "";
  id: number;

  ngOnInit() {
    this.page.enableSwipeBackNavigation = false;
    this.page.actionBarHidden = true;
  }

  pokemon$ = this.route.params.pipe(
    switchMap((params) => {
      this.id = +params["id"];
      this.imgUrl = this.pokedexService.getPokeImage(this.id);
      return this.pokedexService.getPokeDetails(this.id);
    }),
    tap((pokemon) => {
      this.title = pokemon.name;
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
