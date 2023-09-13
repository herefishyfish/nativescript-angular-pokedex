import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import {
  NativeScriptCommonModule,
  registerElement,
} from "@nativescript/angular";
import { CSSType, GridLayout, StackLayout } from "@nativescript/core";
import { PokemonDetails } from "../../../services/pokemon.models";
import { HlmH3Directive } from "~/app/ui/typography/hlm-h3.directive";
import { HlmPDirective } from "~/app/ui/typography/hlm-p.directive";
import { HlmBadgeDirective } from "~/app/ui/badge/hlm-badge.directive";
import { CollectionViewModule } from "@nativescript-community/ui-collectionview/angular";
import { RxFor } from "@rx-angular/template/for";
import { NgIf, TitleCasePipe } from "@angular/common";
import { HlmH4Directive } from "~/app/ui/typography/hlm-h4.directive";

registerElement("pokemon-moves", () => PokemonMovesComponent);

@CSSType("pokemon-moves")
@Component({
  selector: "pokemon-moves",
  template: `
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
          <StackLayout class="text-muted-foreground" orientation="horizontal">
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
  `,
  standalone: true,
  imports: [
    NativeScriptCommonModule,
    NgIf,
    RxFor,
    TitleCasePipe,
    CollectionViewModule,
    HlmH3Directive,
    HlmH4Directive,
    HlmPDirective,
    HlmBadgeDirective,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PokemonMovesComponent extends GridLayout {
  @Input() pokemon: PokemonDetails;
}
