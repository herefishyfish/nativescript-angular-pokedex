import { Component } from '@angular/core'
import { registerElement } from '@nativescript/angular';
import { Canvas } from '@nativescript/canvas';
import { run, exampleSettings, changeSpeed } from './webgpu/planet';
registerElement('Canvas', () => Canvas);
@Component({
  selector: 'ns-app',
  template: `
    <GridLayout>
      <Canvas class="w-full h-full" (ready)="onReady($event)"></Canvas>
      <page-router-outlet actionBarVisibility="never"></page-router-outlet>
    </GridLayout>
  `,
})
export class AppComponent {
  settings = exampleSettings;
  canvas: Canvas;

  onReady(args) {
    console.log('onReady', args);
    this.canvas = args.object as Canvas;
    run(this.canvas);
  }
}
