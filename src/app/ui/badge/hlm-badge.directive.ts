import { Directive, HostBinding, Input } from '@angular/core';
import { cva, VariantProps } from 'class-variance-authority';
import { hlm } from '@spartan-ng/ui-core';
import { ClassValue } from 'clsx';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

const badgeVariants = cva(
  'inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary border-transparent text-primary-foreground',
        secondary: 'bg-secondary border-transparent text-secondary-foreground',
        destructive: 'bg-destructive border-transparent text-destructive-foreground',
        outline: 'text-foreground border-border',
      },
      type: {
        normal: "bg-stone-500 border-transparent text-primary-foreground",
        fire: "bg-orange-500 border-transparent text-primary-foreground",
        water: "bg-sky-500 border-transparent text-primary-foreground",
        grass: "bg-green-600 border-transparent text-primary-foreground",
        electric: "bg-yellow-400 border-transparent text-primary-foreground",
        ice: "bg-blue-300 border-transparent text-primary-foreground",
        fighting: "bg-red-500 border-transparent text-primary-foreground",
        poison: "bg-fuchsia-600 border-transparent text-primary-foreground",
        ground: "bg-orange-300 border-transparent text-primary-foreground",
        flying: "bg-violet-300 border-transparent text-primary-foreground",
        psychic: "bg-pink-600 border-transparent text-primary-foreground",
        bug: "bg-lime-500 border-transparent text-primary-foreground",
        rock: "bg-stone-600 border-transparent text-primary-foreground",
        ghost: "bg-violet-400 border-transparent text-primary-foreground",
        dark: "bg-stone-800 border-transparent text-primary-foreground",
        dragon: "bg-violet-600 border-transparent text-primary-foreground",
        steel: "bg-slate-400 border-transparent text-primary-foreground",
        fairy: "bg-pink-300 border-transparent text-primary-foreground",
      },
      static: { true: '', false: '' },
    },
    compoundVariants: [
      {
        variant: 'default',
        static: false,
        class: 'hover:bg-primary/80',
      },
      {
        variant: 'secondary',
        static: false,
        class: 'hover:bg-secondary/80',
      },
      {
        variant: 'destructive',
        static: false,
        class: 'hover:bg-destructive/80',
      },
    ],
    defaultVariants: {
      variant: 'default',
      static: false,
    },
  }
);
type badgeVariants = VariantProps<typeof badgeVariants>;

@Directive({
  selector: '[hlmBadge]',
  standalone: true,
})
export class HlmBadgeDirective {
  private _variant: badgeVariants['variant'] = 'default';
  @Input()
  get variant(): badgeVariants['variant'] {
    return this._variant;
  }

  set variant(value: badgeVariants['variant']) {
    this._variant = value;
    this._class = this.generateClasses();
  }
  private _type: badgeVariants['type'] = 'normal';
  @Input()
  get type(): badgeVariants['type'] {
    return this._type;
  }

  set type(value: badgeVariants['type']) {
    this._type = value;
    this._class = this.generateClasses();
  }
  private _static: badgeVariants['static'] = false;
  @Input()
  get static(): badgeVariants['static'] {
    return this._static;
  }

  set static(value: BooleanInput) {
    this._static = coerceBooleanProperty(value);
    this._class = this.generateClasses();
  }

  private _inputs: ClassValue = '';

  @Input()
  set class(inputs: ClassValue) {
    this._inputs = inputs;
    this._class = this.generateClasses();
  }

  @HostBinding('class')
  private _class = this.generateClasses();

  private generateClasses() {
    return hlm(badgeVariants({ variant: this._variant, static: this._static, type: this._type }), this._inputs);
  }
}
