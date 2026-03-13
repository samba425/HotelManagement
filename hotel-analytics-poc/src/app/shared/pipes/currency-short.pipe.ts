import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyShort', standalone: true })
export class CurrencyShortPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '$0';
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
    return `${sign}$${abs.toFixed(0)}`;
  }
}
