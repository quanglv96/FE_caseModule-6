import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {Track} from "ngx-audio-player";
import {Songs} from "../model/Songs";

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  audioChange = new Subject<Songs[]>()
  playState = new Subject<boolean>()

  constructor() { }
}
