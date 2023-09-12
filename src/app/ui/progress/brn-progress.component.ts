import { Component, HostBinding, HostListener, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import {
  NativeScriptCommonModule,
  registerElement,
} from "@nativescript/angular";
import {
  CSSType,
  ContentView,
  FlexboxLayout,
  GridLayout,
  LoadEventData,
} from "@nativescript/core";

registerElement("brn-progress", () => BrnProgressComponent);

@CSSType("brn-progress")
@Component({
  selector: "brn-progress",
  template: `
    <ContentView
      (loaded)="loadIndicator($event)"
      class="hlm-progress-indicator"
    >
    </ContentView>
  `,
  host: {
    class: "brn-progress",
  },
  standalone: true,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class BrnProgressComponent extends FlexboxLayout {
  @Input() max: number = 100;
  @Input() value: number = 0;

  get widthPercentage(): number {
    return (this.value / this.max) * 100;
  }

  loadIndicator(event: LoadEventData) {
    const view = event.object as ContentView;
    view.horizontalAlignment = "left";
    view.width = 0;
    
    setTimeout(() => {
      view.animate({
        width: this.widthPercentage + '%',
        duration: 1000,
      });
    }, 100);
  }
}
