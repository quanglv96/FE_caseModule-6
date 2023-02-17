import { Injectable } from '@angular/core';
import {Tags} from "../model/Tags";

@Injectable({
  providedIn: 'root'
})
export class EditStringTagsService {

  constructor() { }
  editStringTag(stringTag: string): Tags[] {
    let list = stringTag.split("#")
    for (let i = 1; i < list.length; i++) {
      if (list[i] !== "") {
        //xóa khoảng trắng
        list[i] = list[i].replaceAll(" ", "");
        // lowe case
        list[i] = list[i].toLowerCase();
      }
    }
    list = Array.from(new Set(list));
    let tag: Tags[] = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i] != "") {
        // @ts-ignore
        tag.push({id: null, name: list[i]})
      }
    }
    return tag;
  }
}
