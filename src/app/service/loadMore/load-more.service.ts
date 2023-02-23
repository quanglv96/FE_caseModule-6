import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoadMoreService {
  private categoriesSubject = new BehaviorSubject<Array<Object>>([]);
  result$ = this.categoriesSubject.asObservable();
  result: Array<Object> = [];
  resultAll: Array<Object> = []

  constructor() {
    this.getNextItems();
    this.categoriesSubject.next(this.result);
  }

  onload(result:Array<Object>,resultAll:Array<Object>){
    this.result=result
    this.resultAll=resultAll;
    this.loadMore();
  }

  loadMore(): void {
    if (this.getNextItems()) {
      this.categoriesSubject.next(this.result);
    }else {
      this.categoriesSubject.next(this.resultAll);
    }
  }

  getNextItems(): boolean {
    if (this.result.length >= this.resultAll.length) {
      return false;
    }
    const remainingLength = Math.min(3, this.resultAll.length - this.result.length);
    this.result.push(...this.resultAll.slice(this.result.length, this.result.length + remainingLength));
    return true;
  }
}
