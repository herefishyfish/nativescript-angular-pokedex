import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import {
  NativeScriptCommonModule,
  registerElement,
} from "@nativescript/angular";
import { CSSType, StackLayout } from "@nativescript/core";
import { PokemonDetails } from "../../../services/pokemon.models";
import { HlmH2Directive } from "~/app/ui/typography/hlm-h2.directive";
import { HlmPDirective } from "~/app/ui/typography/hlm-p.directive";
import { RxFor } from "@rx-angular/template/for";
import { BrnProgressComponent } from "~/app/ui/progress/brn-progress.component";

registerElement("pokemon-stats", () => PokemonStatsComponent);

@CSSType("pokemon-stats")
@Component({
  selector: "pokemon-stats",
  template: `
    <StackLayout
      horizontalAlignment="left"
      orientation="horizontal"
      class="mb-1"
    >
      <StackLayout class="border-border border-r pr-3">
        <Label hlmP>Height</Label>
        <Label hlmH2>{{ pokemon?.height | number : "1.2" }} m </Label>
      </StackLayout>
      <StackLayout class="ml-3">
        <Label hlmP>Weight</Label>
        <Label hlmH2>{{ pokemon?.weight | number : "1.2" }} kg </Label>
      </StackLayout>
    </StackLayout>
    <ng-container *rxFor="let stat of pokemon?.stats">
      <Label>{{ stat?.name | titlecase }} : {{ stat.base_stat }}</Label>
      <brn-progress [max]="255" [value]="stat.base_stat" />
    </ng-container>
  `,
  standalone: true,
  imports: [NativeScriptCommonModule, RxFor, HlmH2Directive, HlmPDirective, BrnProgressComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PokemonStatsComponent extends StackLayout {
  @Input() pokemon: PokemonDetails;

  ngAfterViewInit() {}
}
