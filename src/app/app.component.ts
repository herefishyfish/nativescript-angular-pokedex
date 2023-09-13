import { Component } from '@angular/core'

@Component({
  selector: 'ns-app',
  template: `
    <GridLayout>
      <page-router-outlet actionBarVisibility="never"></page-router-outlet>
    </GridLayout>
  `,
})
export class AppComponent {}
