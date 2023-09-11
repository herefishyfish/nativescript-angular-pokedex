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
import { HlmH3Directive } from "../ui/typography/hlm-h3.directive";
import { HlmH4Directive } from "../ui/typography/hlm-h4.directive";
import { HlmPDirective } from "../ui/typography/hlm-p.directive";
import { PokemonService } from "../services/pokemon.service";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";

@Component({
  template: `
    <GridLayout
      rows="auto auto auto *"
      columns="* auto"
      class="pb-2"
      *rxLet="pokemon$; let pokemon; suspense: suspense; error: error"
    >
      <StackLayout colSpan="2" class="pb-1 pt-2 px-2" orientation="horizontal">
        <Label hlmH1 class="text-primary mr-1">{{
          pokemon?.name | titlecase
        }}</Label>
        <Label hlmH2>#{{ pokemon?.id }}</Label>
      </StackLayout>

      <StackLayout
        row="1"
        colSpan="2"
        class="pb-1 px-2"
        orientation="horizontal"
      >
        <ng-container *rxFor="let type of pokemon.types">
          <Label class="mr-1" hlmBadge [type]="type">{{
            type | titlecase
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

      <Pager
        peaking="8"
        spacing="4"
        row="3"
        colSpan="2"
        (loaded)="onPagerLoaded($event)"
      >
        <StackLayout hlmCard class="p-4" *pagerItem>
          <!-- Stats -->
          <StackLayout horizontalAlignment="left" orientation="horizontal">
            <StackLayout class="border-border border-r pr-3">
              <Label hlmP>Height</Label>
              <Label hlmH2>{{ pokemon.height | number : "1.2" }} m </Label>
            </StackLayout>
            <StackLayout class="ml-3">
              <Label hlmP>Weight</Label>
              <Label hlmH2>{{ pokemon.weight | number : "1.2" }} kg </Label>
            </StackLayout>
          </StackLayout>
          <ng-container *rxFor="let stat of pokemon.stats">
            <Label>{{ stat?.name | titlecase }} : {{ stat.base_stat }}</Label>
          </ng-container>
        </StackLayout>
        <StackLayout hlmCard class="p-4" *pagerItem>
          <!-- Details -->
          <StackLayout
            orientation="horizontal"
            horizontalAlignment="left"
            class="mb-2"
          >
            <StackLayout class="border-border border-r pr-3">
              <Label hlmP>Color</Label>
              <Label hlmH3 class="border-border border-b">{{
                pokemon.species?.color | titlecase
              }}</Label>
            </StackLayout>
            <StackLayout class="ml-3 border-border border-r pr-3">
              <Label hlmP>Shape</Label>
              <Label hlmH3 class="border-border border-b">{{
                pokemon.species?.shape | titlecase
              }}</Label>
            </StackLayout>
            <StackLayout class="ml-3">
              <Label hlmP>Habitat</Label>
              <Label hlmH3 class="border-border border-b">{{
                pokemon.species?.habitat | titlecase
              }}</Label>
            </StackLayout>
          </StackLayout>

          <Label hlmP style="line-height: 0;" class="mb-2" textWrap="true">{{
            pokemon.species.english
          }}</Label>
          <Label hlmP style="line-height: 0;" class="mb-2" textWrap="true">{{
            pokemon.species.japanese
          }}</Label>
        </StackLayout>

        <StackLayout hlmCard class="p-4" *pagerItem>
          <!-- Abilities -->
          <ng-container *rxFor="let ability of pokemon.abilities">
            <Label hlmH3>{{ ability?.name | titlecase }}</Label>
            <Label hlmP style="line-height: 0;" class="mb-2" textWrap="true">{{
              ability?.english
            }}</Label>
            <Label hlmP style="line-height: 0;" class="mb-2" textWrap="true">{{
              ability?.japanese
            }}</Label>
          </ng-container>
        </StackLayout>
        <GridLayout hlmCard class="py-2" *pagerItem>
          <!-- Moves -->
          <CollectionView [items]="pokemon.moves" rowHeight="60">
            <ng-template let-move="item">
              <StackLayout class="px-4">
                <FlexboxLayout justifyContent="space-between">
                  <Label class="text-primary" hlmH4>{{
                    move?.name | titlecase
                  }}</Label>
                  <Label hlmBadge [type]="move.type" alignSelf="center">{{
                    move?.type | titlecase
                  }}</Label>
                </FlexboxLayout>
                <StackLayout orientation="horizontal">
                  <Label hlmP class="mr-2 pr-2 border-border border-r"
                    >PP: {{ move.pp }}</Label
                  >
                  <Label
                    hlmP
                    *ngIf="move.power"
                    class="mr-2 pr-2 border-border border-r"
                    >Power: {{ move.power }}</Label
                  >
                  <Label
                    hlmP
                    *ngIf="move.accuracy"
                    class="mr-2 pr-2 border-border border-r"
                    >Accuracy: {{ move.accuracy }}%</Label
                  >
                </StackLayout>
              </StackLayout>
            </ng-template>
          </CollectionView>
        </GridLayout>
        <StackLayout hlmCard class="p-4" *pagerItem>
          <Label hlmP>Evolutions</Label>
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
      <StackLayout>
        <Label>Could not get pokemon! 🫤</Label>
      </StackLayout>
    </ng-template>
  `,
  standalone: true,
  imports: [
    NativeScriptCommonModule,
    PagerModule,
    CollectionViewModule,
    ImageCacheItModule,
    HlmCardDirective,
    HlmCardHeaderDirective,
    HlmCardTitleDirective,
    HlmH1Directive,
    HlmH2Directive,
    HlmH3Directive,
    HlmH4Directive,
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
  private pokedexService = inject(PokemonService);
  private route = inject(ActivatedRoute);
  private page = inject(Page);
  private pager: Pager;
  private _scrollListener;
  private _currentIndex = new BehaviorSubject(0);
  currentIndex$ = this._currentIndex.pipe(sampleTime(1000 / 60), startWith(0));
  imgUrl = "";
  name = "";
  id: number;

  ngOnInit() {
    // this.page.enableSwipeBackNavigation = false;
    this.page.actionBarHidden = true;
  }

  pokemon$ = this.route.params.pipe(
    switchMap((params) => {
      this.id = +params["id"];
      this.imgUrl = this.pokedexService.getPokemonImage(this.id);
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
