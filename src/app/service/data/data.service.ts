import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private messageSource = new BehaviorSubject('message from service');
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  changeMessage(msg: string) {
    this.messageSource.next(msg);
  }
}
