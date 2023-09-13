import {
  Component,
  EventEmitter,
  Input,
  NO_ERRORS_SCHEMA,
  Output,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  registerElement,
} from "@nativescript/angular";
import { CSSType, StackLayout } from "@nativescript/core";
import { PokemonDetails } from "../../../services/pokemon.models";
import { HlmH4Directive } from "~/app/ui/typography/hlm-h4.directive";
import { HlmPDirective } from "~/app/ui/typography/hlm-p.directive";
import { RxFor } from "@rx-angular/template/for";
import { ImageCacheItModule } from "@triniwiz/nativescript-image-cache-it/angular";
import { NgIf } from "@angular/common";

registerElement("pokemon-evolutions", () => PokemonEvolutionsComponent);

@CSSType("pokemon-evolutions")
@Component({
  selector: "pokemon-evolutions",
  template: `
    <ng-container
      *rxFor="let pokemon of pokemon?.species?.evolutions; let last = last"
    >
      <GridLayout rows="auto auto auto" (tap)="tapEvent(pokemon.id)">
        <StackLayout orientation="horizontal">
          <Label
            hlmP
            style="line-height: 0;"
            class="m-2 border-border border-b text-muted-foreground"
            >#{{ pokemon?.id }}</Label
          >
          <Label hlmH4>{{ pokemon?.name | titlecase }}</Label>
        </StackLayout>
        <ImageCacheIt
          row="1"
          width="100"
          height="100"
          style="margin: -8;"
          [src]="pokemon?.sprite"
          stretch="aspectFill"
        ></ImageCacheIt>
        <Label
          *ngIf="!last"
          text="&#xf078;"
          row="2"
          class="fa w-full h-6 bg-accent text-accent-foreground p-0 text-center"
        ></Label>
      </GridLayout>
    </ng-container>
  `,
  standalone: true,
  imports: [
    NativeScriptCommonModule,
    RxFor,
    NgIf,
    HlmH4Directive,
    HlmPDirective,
    ImageCacheItModule,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PokemonEvolutionsComponent extends StackLayout {
  @Input() pokemon: PokemonDetails;
  @Output() tapped = new EventEmitter<number>();

  tapEvent(id: number) {
    this.tapped.emit(id);
  }
}
