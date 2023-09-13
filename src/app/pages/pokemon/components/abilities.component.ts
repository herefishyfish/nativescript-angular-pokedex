import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import {
  NativeScriptCommonModule,
  registerElement,
} from "@nativescript/angular";
import { CSSType, StackLayout } from "@nativescript/core";
import { PokemonDetails } from "../../../services/pokemon.models";
import { HlmH3Directive } from "~/app/ui/typography/hlm-h3.directive";
import { HlmPDirective } from "~/app/ui/typography/hlm-p.directive";
import { RxFor } from "@rx-angular/template/for";

registerElement("pokemon-abilities", () => PokemonAbilitiesComponent);

@CSSType("pokemon-abilities")
@Component({
  selector: "pokemon-abilities",
  template: `
    <ng-container *rxFor="let ability of pokemon.abilities">
      <Label hlmH3>{{ ability?.name | titlecase }}</Label>
      <Label hlmP style="line-height: 0;" class="mb-2" textWrap="true">{{
        ability?.english
      }}</Label>
      <Label hlmP style="line-height: 0;" class="mb-2" textWrap="true">{{
        ability?.japanese
      }}</Label>
    </ng-container>
  `,
  standalone: true,
  imports: [NativeScriptCommonModule, RxFor, HlmH3Directive, HlmPDirective],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PokemonAbilitiesComponent extends StackLayout {
  @Input() pokemon: PokemonDetails;

  ngAfterViewInit() {
  }
}
