import {Pipe, PipeTransform} from "@angular/core";
import {Singer} from "../../model/Singer";
import {toHtml} from "@fortawesome/fontawesome-svg-core";
import htmlString = JQuery.htmlString;

@Pipe({
  name: 'toStringSinger'
})
export class ToStringSinger implements PipeTransform {
  constructor() {
  }

  transform(list: Singer[]|any):htmlString {
    let content:htmlString;
    if(list!=undefined){
      content=" - ";
      for (let i = 0; i < list.length; i++) {
        content+=`<a routerLink="singer/${list[i].id}">${list[i].name}</a>`
        // content+=list[i].name
        if(i<list.length-1){
          content+=' x ';
        }
      }
    }
    // @ts-ignore
    return content;
  }
}
