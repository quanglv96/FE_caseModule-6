import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  constructor() {
  }

  transform<T, U>(value: T[], name: U): any {
    let list:T[]=[]
    let colum:string|undefined;
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
        list=value;
        break;
    }
    if(colum){
      for (let i = 0; i < value.length; i++) {
        // @ts-ignore
        if(value[i][colum]){
          list.push(value[i]);
        }
      }
    }
    list.sort((a,b)=>{
      // @ts-ignore
      if ( a['name'].toLowerCase()  < b['name'].toLowerCase()){
        return -1;
      }
      // @ts-ignore
      if ( a['name'].toLowerCase() > b['name'].toLowerCase() ){
        return 1;
      }
      return 0;
    })
    return list;
  }

}
