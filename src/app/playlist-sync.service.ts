import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {Songs} from "./model/Songs";

@Injectable({
  providedIn: 'root'
})
export class PlaylistSyncService {
  currentSongOfPlayerId: number = -1;
  currentSongOfPlaylistPageId: number = -1;
  currentPlaylistOfPlayerId: number = -1;
  currentPlaylistOfPlaylistPageId: number = -1;
  isPlayListPageStartPlaying: boolean = false;
  isPlayerPlaying: boolean = false
  onPlaylistChange = new Subject<{id: number, songList: Songs[]}>()
  onSongChange = new Subject<{state: string, song: Songs}>()
  onPlayPauseToggle = new Subject<string>()
  onPlayerLoaded = new Subject<string>()
  onFastForwardSong = new Subject<{source: string, pos: number}>()
  onTogglePlayPause = new Subject<string>()
  onRetrievingCurrentTime = new Subject<{action: string, pos: number}>()
  onPageChange = new Subject<string>()
  onRetrieveCurrentSongOfPlayer = new Subject<{desc: string, song: Songs}>()
  count: number = 0

  constructor() { }

  comparePlaylist() {
    return this.currentPlaylistOfPlayerId === this.currentPlaylistOfPlaylistPageId
  }

  compareSong() {
    return this.currentSongOfPlaylistPageId === this.currentSongOfPlayerId
  }
}
