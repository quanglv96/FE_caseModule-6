import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  constructor() {
  }

  transform<T, U>(value: T[], name: U): any {
    let list:T[]=[]
    let colum:string='';
    switch (name) {
      case 'songs':
        colum='audio'
        break;
      case 'playlist':
        colum='description';
        break;
      case 'users':
        colum='username';
        break;
      default:
        return value;
    }
    for (let i = 0; i < value.length; i++) {
      // @ts-ignore
      if(value[i][colum]){
        list.push(value[i]);
      }
    }
    return list;
  }

}
