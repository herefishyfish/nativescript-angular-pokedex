import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import {
  NativeScriptCommonModule,
  registerElement,
} from "@nativescript/angular";
import { CSSType, StackLayout } from "@nativescript/core";
import { PokemonDetails } from "../../../services/pokemon.models";
import { HlmH3Directive } from "~/app/ui/typography/hlm-h3.directive";
import { HlmPDirective } from "~/app/ui/typography/hlm-p.directive";

registerElement("pokemon-details", () => PokemonDetailsComponent);

@CSSType("pokemon-details")
@Component({
  selector: "pokemon-details",
  template: `
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
  `,
  standalone: true,
  imports: [NativeScriptCommonModule, HlmH3Directive, HlmPDirective],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PokemonDetailsComponent extends StackLayout {
  @Input() pokemon: PokemonDetails;

  ngAfterViewInit() {}
}
