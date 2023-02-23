import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {Songs} from "../model/Songs";

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  songOfPageId?: number
  songOfBarId?: number
  songChange = new Subject<{song: Songs, source: string}>()
  playlistChange = new Subject<Songs[]>()
  playState = new Subject<string>()
  fastForwardPos = new Subject<{source: string, pos: number}>()
  loadSongOfBarComplete = false;
  loadSongOfBarChange = new Subject()
  loadSongOfPageComplete = false;
  loadSongOfPageChange = new Subject()
  currentTimeOfBar = new Subject();
  loadStateChange = new Subject<string>()

  constructor() { }

  compareSong() {
    return this.songOfPageId === this.songOfBarId
  }
}
