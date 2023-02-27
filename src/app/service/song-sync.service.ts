import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {Songs} from "../model/Songs";

@Injectable({
  providedIn: 'root'
})
export class SongSyncService {
  songOfPageId: number = -1;
  songOfPlayerId: number = -1;
  isPlayerPlaying: boolean = false;
  isSongPagePlaying: boolean = true;
  currentTimeSongPage: number = 0;
  onSongChange = new Subject<{song: Songs, suggest: Songs[]}>()
  onPageChange = new Subject<string>()
  onPlayPause = new Subject<string>()
  onFastForwardSong = new Subject<{source: string, pos: number}>()
  onRequestCurrentTime = new Subject<string>()
  onResponseCurrentTime = new Subject<{desc: string, pos: number}>()
  onNavigateSong = new Subject<{state: string, data: any}>()
  loadSongOfBarChange = new Subject()
  loadSongOfPlaylistComplete = false;
  loadSongOfPageChange = new Subject()

  loadStateChange = new Subject<string>()
  nextChange = new Subject<{state: string, id: number}>()
  action:string = ''

  constructor() { }

  compareSong() {
    return this.songOfPageId === this.songOfPlayerId
  }
}
