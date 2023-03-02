import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {Songs} from "./model/Songs";

@Injectable({
  providedIn: 'root'
})
export class PlaylistSyncService {
  playerCurrentTime: number = 0;
  currentSongIdOfPlayer: number = -2;
  currentSongIdOfPLPage: number = -2;
  currentPLIdOfPlayer: number = -2;
  currentPLIdOfPLPage: number = -2;
  playlistOnLoadPos: number = 0;
  playlistOnLoadState: string = ''
  isPLPageStartLoading: boolean = false;
  isPLPageLoadComplete: boolean = false;
  isPLPagePlaying: boolean = false;
  isPlayerPlaying: boolean = false;
  onPLPageLoadingComplete = new Subject<{state: string, data: any}>()
  onPlaylistChange = new Subject<{id: number, songList: Songs[]}>()
  onSongChange = new Subject<{state: string, song: Songs}>()
  onPLPageStartPlay = new Subject<string>()
  onPlayPauseToggle = new Subject<string>()
  onPlayerLoaded = new Subject<string>()
  onPlaylistPageLoadedSong = new Subject<string>()
  onFastForwardSong = new Subject<{source: string, pos: number}>()
  // onTogglePlayPause = new Subject<string>()
  onRequestCurrentTime = new Subject<{action: string, pos: number}>()
  onResponseCurrentTime = new Subject<{action: string, pos: number}>()
  onPageChange = new Subject<string>()
  onRetrieveCurrentSongOfPlayer = new Subject<{desc: string, song: Songs}>()
  onNavigateToSong = new Subject<{desc: string, data: any}>()
  count: number = 0

  constructor() { }

  comparePlaylist() {
    return this.currentPLIdOfPlayer === this.currentPLIdOfPLPage
  }

  compareSong() {
    return this.currentSongIdOfPLPage === this.currentSongIdOfPlayer
  }
}
