import { Pipe, PipeTransform } from '@angular/core';
import { Color } from '@nativescript/core';

@Pipe({ name: 'colorTransition', standalone: true })
export class ColorTransitionPipe implements PipeTransform {
  toColor: Color;
  fromColor: Color;

  lerp(a, b, value) {
    return a + (b - a) * value;
  }

  setColors(from: string, to: string) {
    if (!this.fromColor) {
      this.fromColor = new Color(from);
    }
    if (!this.toColor) {
      this.toColor = new Color(to);
    }
  }

  transform(value: number, index: number, from: string, to: string): any {
    const diff = Math.abs(value - index);

    if (diff >= 1) {
      return to;
    }
    if (diff === 0) {
      return from;
    }

    this.setColors(from, to);
    const r = this.lerp(this.fromColor.r, this.toColor.r, diff);
    const g = this.lerp(this.fromColor.g, this.toColor.g, diff);
    const b = this.lerp(this.fromColor.b, this.toColor.b, diff);

    return `rgb(${r},${g},${b})`;
  }
}
