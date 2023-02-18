import {Pipe, PipeTransform} from "@angular/core";
import {Singer} from "../../model/Singer";

@Pipe({
  name: 'toStringSinger'
})
export class ToStringSinger implements PipeTransform {
  constructor() {
  }

  transform(list: Singer[]|any):string {
    let content='';
    if(list.length>0){
      content=" - ";
      for (let i = 0; i < list.length; i++) {
        content+=list[i].name
        if(i<list.length-1){
          content+=' x ';
        }
      }
    }
    return content;
  }
}
