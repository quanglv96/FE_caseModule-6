import { Injectable } from '@angular/core';
import {Singer} from "../model/Singer";

@Injectable({
  providedIn: 'root'
})
export class EditStringSingerService {

  constructor() { }
  editStringSinger(stringSinger: string): Singer[] {
    let list = stringSinger.split(",")
    let singer: Singer[] = []
    for (let i = 0; i < list.length; i++) {
      let listIndex = list[i].split(" ")
      list[i] = "";
      for (let j = 0; j < listIndex.length; j++) {
        list[i] += listIndex[j].charAt(0).toUpperCase() + listIndex[j].slice(1).toLowerCase() + " ";
      }
      // @ts-ignore
      singer.push({id: null, name: list[i]})
    }
    return singer;
  }
}
