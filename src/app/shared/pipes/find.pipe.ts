import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'find',
  standalone: true
})
export class FindPipe implements PipeTransform {
  transform(array: any[], key: string, value: any): any {
    if (!array || !key || value === undefined) return null;
    return array.find(item => item[key] === value);
  }
}