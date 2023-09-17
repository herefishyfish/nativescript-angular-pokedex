import { ChangeDetectionStrategy, Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import {
  NativeScriptCommonModule,
  registerElement,
} from "@nativescript/angular";
import { GridLayout } from "@nativescript/core";
import { ImageCacheItModule } from "@triniwiz/nativescript-image-cache-it/angular";
import { HlmH3Directive } from "../../../ui/typography/hlm-h3.directive";
import { Pokemon } from "../../../services/pokemon.models";
import { HlmCardDirective } from "~/app/ui/card/hlm-card.directive";

registerElement("pokemon-card", () => GridLayout);

@Component({
  selector: "pokemon-card",
  template: `
    <ContentView row="1" rowSpan="2" colSpan="2" hlmCard class="p-2 px-4">
    </ContentView>
    <ImageCacheIt
      class="image mx-4"
      stretch="aspectFit"
      [sharedTransitionTag]="'poke-image-' + pokemon.id"
      [src]="pokemon?.image"
      [width]="displayMode === 'fill' ? 90 : 50"
      [translateX]="displayMode === 'fill' ? 0 : 15"
      [translateY]="displayMode === 'fill' ? 0 : -5"
    ></ImageCacheIt>
    <StackLayout
      class="p-2 px-4"
      style="z-index: 4;"
      row="1"
      colSpan="2"
      rowSpan="2"
    >
      <Label class="text-primary">#{{ pokemon?.id }}</Label>
      <Label hlmH3 class="text-primary">{{ pokemon?.name | titlecase }}</Label>
    </StackLayout>
  `,
  styles: [
    `
      .image {
        column: 1;
        row-span: 3;
        z-index: 3;
      }
    `,
  ],
  standalone: true,
  imports: [
    NativeScriptCommonModule,
    ImageCacheItModule,
    HlmH3Directive,
    HlmCardDirective,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  host: {
    rows: '30,30,40',
    columns: '*,auto',
    padding: '8'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokemonPageCardComponent {
  @Input() pokemon: Pokemon;
  @Input() displayMode;
}
