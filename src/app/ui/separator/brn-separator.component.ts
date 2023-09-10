import { Component, Input } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { CSSType, StackLayout } from '@nativescript/core';
import { registerElement } from '@nativescript/angular';

registerElement('brn-separator', () => BrnSeparatorComponent);

export type BrnSeparatorOrientation = 'horizontal' | 'vertical';

@CSSType('brn-separator')
@Component({
  selector: 'brn-separator',
  standalone: true,
  template: '',
})
export class BrnSeparatorComponent extends StackLayout {
  protected _orientation: BrnSeparatorOrientation = 'horizontal';
  @Input()
  set separatorOrientation(value: BrnSeparatorOrientation) {
    this._orientation = value;
  }

  protected _decorative = false;
  @Input()
  set decorative(value: BooleanInput) {
    this._decorative = coerceBooleanProperty(value);
  }
}
