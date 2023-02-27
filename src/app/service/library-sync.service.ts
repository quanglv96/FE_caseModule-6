import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LibrarySyncService {
  onPageChange = new Subject<string>()

  constructor() { }
}
