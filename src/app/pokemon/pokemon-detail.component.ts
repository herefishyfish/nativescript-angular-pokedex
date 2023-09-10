import { Component, NO_ERRORS_SCHEMA, OnInit, inject } from '@angular/core';
import { Image, Page } from '@nativescript/core';
import { PokedexService } from './pokedex.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { HlmCardDirective } from '../ui/card/hlm-card.directive';
import { NgFor, TitleCasePipe } from '@angular/common';
import { RxLet } from '@rx-angular/template/let';
import { HlmH1Directive } from '../ui/typography/hlm-h1.directive';
import { HlmH2Directive } from '../ui/typography/hlm-h2.directive';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { HlmCardHeaderDirective } from '../ui/card/hlm-card-header.directive';
import { HlmCardTitleDirective } from '../ui/card/hlm-card-title.directive';
import { HlmBadgeDirective } from '../ui/badge/hlm-badge.directive';
import { ImageCacheItModule } from '@triniwiz/nativescript-image-cache-it/angular';

@Component({
  template: `
    <StackLayout>
      <GridLayout rows="auto auto" columns="auto auto" class="p-2">
        <Label hlmH1>{{ title | titlecase }}</Label>
        <Label column="1" class="ml-2" hlmH2>#{{ id }}</Label>
      </GridLayout>

      <ImageCacheIt [sharedTransitionTag]="'poke-image-' + id" height="300" [src]="imgUrl"></ImageCacheIt>

      <ng-container
        *rxLet="
        pokemon$; let pokemon;
        suspense: suspense;
        error: error;
        "
      >
        <StackLayout hlmCard margin="20" padding="10">
          <GridLayout rows="auto auto" columns="* auto" hlmCardHeader>
            <Label hlmCardTitle>{{ pokemon.name | titlecase }}</Label>
            <Label row="1">{{ pokemon.id }}</Label>
            <ng-container *ngFor="let type of pokemon.types; let i = index;">
              <Label hlmBadge [row]="i" column="1">{{ type.type.name }}</Label>
            </ng-container>
          </GridLayout>
        </StackLayout>
      </ng-container>
    </StackLayout>
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
    ImageCacheItModule,
    HlmCardDirective,
    HlmCardHeaderDirective,
    HlmCardTitleDirective,
    HlmH1Directive,
    HlmH2Directive,
    HlmBadgeDirective,
    TitleCasePipe,
    RxLet,
    NgFor,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PokemonDetailComponent implements OnInit {
  private pokedexService = inject(PokedexService);
  private route = inject(ActivatedRoute);
  private page = inject(Page);
  imgUrl = '';
  title = '';
  id: number;

  ngOnInit() {
    this.page.enableSwipeBackNavigation = false;
    // this.page.actionBarHidden = true;
  }

  pokemon$ = this.route.params.pipe(
    switchMap((params) => {
      this.id = +params['id'];
      this.imgUrl = this.pokedexService.getPokeImage(this.id);
      return this.pokedexService.getPokeDetails(this.id);
    }),
    tap((pokemon) => {
      this.title = pokemon.name;
    })
  );
}
