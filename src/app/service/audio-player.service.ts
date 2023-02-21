import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {Track} from "ngx-audio-player";

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  audioChange = new Subject<Track[]>()
  playState = new Subject<boolean>()

  constructor() { }
}
