import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {AudioPlayerService} from "../service/audio-player.service";
import {Songs} from "../model/Songs";
import {Observable} from "rxjs";
import * as moment from "moment";
import {PlaylistSyncService} from "../playlist-sync.service";

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit {
  indexArr: number[] = []
  playMode = 'auto';
  loopMode = 'none'
  shuffle = false;
  repeat = false;
  index: number = -1;
  tracks: Songs[] = []
  currentTrack?: Songs
  isPlay: boolean = false
  loadingComplete: boolean = false
  duration: string = '00:00'
  currentTime: string = ''
  seek: number = 0
  totalTime: number = 0;
  loadState: string = 'page'
  showPlaylist: boolean = false;
  actionPage: string = 'none';

  audio = new Audio()
  audioEvents = [
    "ended",
    "error",
    "play",
    "playing",
    "pause",
    "timeupdate",
    "canplay",
    "loadedmetadata",
    "loadstart",
    "canplaythrough",
  ];

  constructor(private audioService: AudioPlayerService,
              private playlistSyncService: PlaylistSyncService) {
    this.currentTrack = JSON.parse(localStorage.getItem('currentSong') as string)
    this.streamObserver(this.currentTrack?.audio as string).subscribe();
    this.audioService.songOfBarId = +(this.currentTrack?.id as string)
    this.playlistSyncService.currentSongOfPlayerId = +(this.currentTrack?.id as string)
    this.tracks = JSON.parse(localStorage.getItem('playlist') as string)
    this.index = Number(localStorage.getItem('currentSongIndex'))
    this.audioService.playlistOfBarId = Number(localStorage.getItem('playlistId') as string)
    this.playlistSyncService.currentPlaylistOfPlayerId = Number(localStorage.getItem('playlistId') as string)
  }
  /** Subscribe event when start page */
  ngOnInit() {
    // this.actionSubscribe()
    this.subscribeEventFromPlaylistPage()
  }
  /** Subscribe for play song action */
  actionSubscribe() {
    this.playPauseSubscribe();
    this.fastForwardSubscribe();
    this.playListSubscribe();
    this.newSongSubscribe();
    this.timelineSubscribe();
    this.loadStateSubscribe();
  }
  /** Single subscribe */
  playPauseSubscribe() {
    this.audioService.playState.subscribe(
      data => {
        if (data === 'barPlay') {
          this.audio.play().then(() => {
            this.isPlay = true
          })
        } else if (data === 'barPause') {
          this.audio.pause();
          this.isPlay = false;
        }
      }
    )
  }
  fastForwardSubscribe() {
    this.audioService.fastForwardPos.subscribe(
      (pos) => {
        if (pos.source === 'page') {
          this.audio.currentTime = pos.pos;
        }
      }
    )
  }
  newSongSubscribe() {
    this.audioService.songChange.subscribe(track => {
      this.audio.pause();
      this.isPlay = false;
      this.audio.currentTime = 0;
      this.audioService.loadSongOfBarComplete = false;
      this.currentTrack = track.song
      console.log(this.currentTrack)
      localStorage.setItem('currentSong', JSON.stringify(this.currentTrack))
      this.streamObserver(track.song.audio as string).subscribe();
      this.audioService.songOfBarId = +(this.currentTrack?.id as string)
      this.randomCreatePlaylistSubscribe(track.source)
    })
  }
  randomCreatePlaylistSubscribe(source: string) {
    switch (source) {
      case 'songDetails':
        this.audioService.playlistChange.subscribe(playlist => {
          this.tracks = [this.currentTrack as Songs, ...playlist.playlist];
          this.audioService.playlistOfBarId = playlist.id
          localStorage.setItem('playlistId', JSON.stringify(playlist.id))
          localStorage.setItem('playlist', JSON.stringify(this.tracks))
          this.index = 0;
          localStorage.setItem('currentSongIndex', this.index.toString())
          this.audioService.songOfBarId = +(this.currentTrack?.id as string)
        })
        break;
    }
  }
  playListSubscribe() {
    this.audioService.playlistChange.subscribe(playlist => {
      this.tracks = playlist.playlist;
      this.audioService.playlistOfBarId = playlist.id
      localStorage.setItem('playlistId', JSON.stringify(playlist.id))
      localStorage.setItem('playlist', JSON.stringify(this.tracks))
      this.index = this.tracks.findIndex((track) => track.id == this.currentTrack?.id);
      localStorage.setItem('currentSongIndex', this.index.toString())
      this.audioService.songOfBarId = +(this.currentTrack?.id as string)

    })
  }
  timelineSubscribe() {
    this.audioService.loadSongOfPageChange.subscribe(
      () => {
        const currentTime = this.audio.currentTime
        if (currentTime > 0) {
          this.audioService.currentTimeOfBar.next(currentTime);
        }
      }
    )
  }
  loadStateSubscribe() {
    this.audioService.loadStateChange.subscribe(
      data => {
        this.loadState = data;
      }
    )
  }
  /** Stream object for audio */
  streamObserver(url: string) {
    return new Observable(observer => {
      this.audio.src = url
      this.audio.load()
      const handler = (event: Event) => {
        switch (event.type) {
          case "canplaythrough":
            this.loadingComplete = true;
            this.audioService.loadSongOfBarChange.next(this.loadState);
            this.playlistSyncService.onPlayerLoaded.next(this.loadState);
            if (this.loadState === 'playlist-first-play') {
              this.audio.play().then(() => {this.isPlay = true})
            }
            this.duration = this.formatTime(this.audio.duration)
            this.totalTime = this.audio.duration;
            break;
          case "play":
            this.isPlay = true;
            this.playlistSyncService.isPlayerPlaying = true;
            break;
          case "pause":
            this.isPlay = false;
            this.playlistSyncService.isPlayerPlaying = false;
            break;
          case "timeupdate":
            this.fillProgress()
            this.currentTime = this.formatTime(this.audio.currentTime);
            this.seek = this.audio.currentTime;
            break;
          case "ended":
            // this.audio.pause();
            // this.isPlay = false;
            // this.next()
            break;
        }
      }
      this.addEvent(this.audio, this.audioEvents, handler)
      return () => {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.removeEvent(this.audio, this.audioEvents, handler)
      }
    })
  }
  /** Add event listener */
  addEvent(obj: HTMLAudioElement, events: string[], handler: any) {
    events.forEach((event) => {
      obj.addEventListener(event, handler);
    })
  }
  /** Remove event listener */
  removeEvent(obj: HTMLAudioElement, events: string[], handler: any) {
    events.forEach((event) => {
      obj.removeEventListener(event, handler);
    })
  }
  /** Song action */
  playPause() {
    // console.log(this.audioService.playlistOfBarId, this.audioService.playlistOfPageId)
    // if (this.audioService.comparePlayList() && !this.audioService.loadSongOfPlaylistComplete) {
    //
    //   this.audioService.nextChange.next({state: 'pageIsNotLoad', id: this.index});
    //   return
    // }
    // if (this.loadingComplete) {
    //   if (!this.isPlay) {
    //     this.audio.play().then(() => {
    //       this.isPlay = true;
    //       if (this.audioService.compareSong()) {
    //         this.audioService.playState.next('pagePlay')
    //       }
    //     })
    //   } else {
    //     this.audio.pause();
    //     this.isPlay = false
    //     if (this.audioService.compareSong()) {
    //       this.audioService.playState.next('pagePause')
    //     }
    //   }
    // }
    this.togglePlayPauseWithPlaylistPage()
    this.togglePlayPauseWhenNoPageIsLoad()
  }
  next() {
    this.audio.pause();
    this.audioService.action = 'next'
    if (this.audioService.activePage === 'playlistDetails' && this.audioService.comparePlayList()) {
      this.nextOnPlayListPage();
    } else {
      this.nextOnAudioPlayer()
    }
    this.audioService.action = ''
  }
  prev() {
    if (this.index > 0) {
      this.index--
      this.moveTo(this.index);
    }
  }
  moveToSong(i: number) {
    if (!this.checkIndex(i)) {
      this.moveTo(i)
    }
  }
  moveTo(i: number) {
    this.currentTrack = this.tracks[i];
    this.index = i
    this.playlistSyncService.currentSongOfPlayerId = Number(this.currentTrack.id);
    this.audioService.loadStateChange.next('next/prev')
    this.audioService.songOfBarId = +(this.currentTrack?.id as string)
    this.streamObserver(this.currentTrack.audio as string).subscribe();
    if (this.audioService.compareSong()) {
      this.audioService.loadStateChange.next('page')
    }
    localStorage.setItem('currentSong', JSON.stringify(this.currentTrack))
    localStorage.setItem('currentSongIndex', this.index.toString())
  }
  changePlayMode() {
    if (this.playMode === 'auto') {
      this.playMode = 'shuffle'
    } else {
      this.playMode = 'auto'
    }
  }
  changeLoopMode() {
    if (this.loopMode === 'none') {
      this.loopMode = 'one'
    } else if (this.loopMode === 'one') {
      this.loopMode = 'loop'
    } else if (this.loopMode === 'loop') {
      this.loopMode = 'none'
    }
  }
  seekTo(event: Event) {
    let input = event.target as HTMLInputElement
    let position = Number(input.value);
    this.audio.currentTime = position;
    if (this.audioService.compareSong()) {
      this.audioService.fastForwardPos.next({source: 'bar', pos: position})
    }
    if (this.playlistSyncService.compareSong()) {
      this.playlistSyncService.onFastForwardSong.next({source: 'player', pos: position})
    }
  }
  /** Next song on playlist page */
  nextOnPlayListPage() {
    if (this.loopMode === 'one') {
      this.audio.currentTime = 0;
      this.audioService.fastForwardPos.next({source: 'bar', pos: 0})
    } else if (this.playMode === 'auto') {
      this.nextOnPlaylistPageAutoMode()
    } else if (this.playMode == 'shuffle') {
      if (this.indexArr.length < this.tracks.length - 1) {
        this.indexArr.push(this.index)
        this.nextOnPlaylistPageShuffleMode()
      } else {
        if (this.loopMode == 'loop') {
          this.indexArr = []
          this.nextOnPlaylistPageShuffleMode()
        }
      }
    }
  }
  nextOnPlaylistPageAutoMode() {
    if (this.index < this.tracks.length - 1) {
      this.index++
      this.currentTrack = this.tracks[this.index]
      this.audioService.nextChange.next({state: 'next', id: this.index})
      localStorage.setItem('currentSong', JSON.stringify(this.currentTrack))
      localStorage.setItem('currentSongIndex', this.index.toString())
    } else {
      if (this.loopMode === 'loop') {
        this.index = 0
        this.currentTrack = this.tracks[this.index]
        this.audioService.nextChange.next({state: 'next', id: this.index})
        localStorage.setItem('currentSong', JSON.stringify(this.currentTrack))
        localStorage.setItem('currentSongIndex', this.index.toString())
      }
    }
  }
  nextOnPlaylistPageShuffleMode() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.tracks.length)
    } while (this.indexArr.includes(newIndex))
    this.index = newIndex;
    this.currentTrack = this.tracks[this.index]
    this.audioService.nextChange.next({state: 'next', id: this.index})
    localStorage.setItem('currentSong', JSON.stringify(this.currentTrack))
    localStorage.setItem('currentSongIndex', this.index.toString())
  }
  /** Next song on audio player */
  nextOnAudioPlayer() {
    if (this.loopMode === 'one') {
      this.audio.currentTime = 0;
      if (this.audioService.compareSong()) {
        this.audioService.fastForwardPos.next({source: 'bar', pos: 0})
      }
    } else if (this.playMode === 'auto') {
      this.nextOnAudioPlayerAutoMode()
    } else if (this.playMode == 'shuffle') {
      if (this.indexArr.length < this.tracks.length - 1) {
        this.indexArr.push(this.index)
        this.nextOnAudioPlayerShuffleMode()
      } else {
        if (this.loopMode == 'loop') {
          this.indexArr = []
          this.nextOnAudioPlayerShuffleMode()
        }
      }
    }
  }
  nextOnAudioPlayerAutoMode() {
    if (this.index < this.tracks.length - 1) {
      this.index++
      this.moveTo(this.index)
    } else {
      if (this.loopMode === 'loop') {
        this.index = 0
        this.moveTo(this.index)
      }
    }
  }
  nextOnAudioPlayerShuffleMode() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.tracks.length)
    } while (this.indexArr.includes(newIndex))
    this.index = newIndex
    this.moveTo(this.index)
  }
  /** Other util action */
  fillProgress() {
    let input = document.querySelector('.timeline') as HTMLInputElement
    let min = +input.min;
    let max = +input.max;
    let val = +input.value;
    let percentage = (val - min) / (max - min) * 100;
    input.style.setProperty('--percentage', percentage + '%')
  }
  formatTime(time: number) {
    let format: string = "mm:ss"
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }
  closePlaylist() {
    this.showPlaylist = false
  }
  togglePlaylist() {
    this.showPlaylist = !this.showPlaylist;
  }
  checkIndex(i: number) {
    return this.index === i
  }




  newNext() {
    this.nextWithPlaylistPage()
  }


  /** Playlist page sync handle */
  subscribeEventFromPlaylistPage() {
    this.onSongOfPLPageChange();
    this.onPlaylistOfPLPageChange();
    this.onPlaylistPageFastForward();
    this.onPlaylistTogglePlayPause();
    this.onPlaylistRetrievingCurrentTime();
    this.onPlaylistPageChange()
  }
  onPlaylistOfPLPageChange() {
    this.playlistSyncService.onPlaylistChange.subscribe(
      songList => {
        this.tracks = songList.songList;
        this.playlistSyncService.currentPlaylistOfPlayerId = songList.id
        localStorage.setItem('playlistId', JSON.stringify(songList.id))
        localStorage.setItem('playlist', JSON.stringify(this.tracks))
      }
    )
  }
  onSongOfPLPageChange() {
    this.playlistSyncService.onSongChange.subscribe(
      song => {
        if (song.state === 'first-play') {
          this.currentTrack = song.song;
          this.index = this.getIndex()
          this.playlistSyncService.currentSongOfPlayerId = Number(this.currentTrack?.id)
          localStorage.setItem('currentSong', JSON.stringify(this.currentTrack))
          localStorage.setItem('currentSongIndex', this.index.toString())
          this.audio.src = this.currentTrack?.audio as string
          this.loadState = 'playlist-first-play'
          this.audio.load()
        }
      }
    )
  }
  onPlaylistPageFastForward() {
    this.playlistSyncService.onFastForwardSong.subscribe(
      data => {
        if (data.source === 'playlist-page' && this.playlistSyncService.compareSong()) {
          this.audio.currentTime = data.pos
        }
      }
    )
  }
  onPlaylistTogglePlayPause() {
    this.playlistSyncService.onTogglePlayPause.subscribe(
      data => {
        if (data === 'playlist-page-play' || data === 'play-when-player-play' ||
            data === 'player-next-song') {
          this.audio.play().then(() => {this.isPlay = true})
        }
        if (data === 'playlist-page-pause') {
          this.audio.pause()
          this.isPlay = false;
        }
      }
    )
  }
  onPlaylistRetrievingCurrentTime() {
    this.playlistSyncService.onRetrievingCurrentTime.subscribe(
      data => {
        if (data.action === 'playlist-request-current-time' && data.pos === -1 && this.isPlay) {
          const currentTime = this.audio.currentTime
          this.playlistSyncService.onRetrievingCurrentTime.next({action: 'player-respond-current-time', pos: currentTime})
        }
      }
    )
  }
  onPlaylistPageChange() {
    this.playlistSyncService.onPageChange.subscribe(data => {this.actionPage = data})
  }
  /** Action with playlist page */
  /** Play / pause */
  togglePlayPauseWithPlaylistPage() {
    if (this.actionPage === 'playlist') {
      if (!this.playlistSyncService.isPlayListPageStartPlaying && this.playlistSyncService.comparePlaylist()) {
        this.renderAndPlayAudioOfPlaylistPage()
      } else {
        this.togglePlayPauseWhenPlaylistPageIsLoaded()
      }
    }
  }
  renderAndPlayAudioOfPlaylistPage() {
    if (this.playlistSyncService.comparePlaylist()) {
      this.playlistSyncService.onRetrieveCurrentSongOfPlayer.next(
        {desc: 'retrieve-when-first-play', song: this.currentTrack as Songs}
      )}
  }
  togglePlayPauseWhenPlaylistPageIsLoaded() {
    if (!this.isPlay) {
      this.audio.play().then(() => {
        this.isPlay = true
      })
    } else {
      this.audio.pause()
      this.isPlay = false;
    }
  }
  /** Next / prev / move to */
  nextWithPlaylistPage() {
    if (this.actionPage === 'playlist' && this.playlistSyncService.comparePlaylist()) {
      if (this.index < this.tracks.length - 1) {
        this.index++
        this.moveToAChosenSong(this.index)
      }
    }
  }
  prevWithPlaylistPage() {

  }
  moveToAChosenSong(index: number) {
    this.currentTrack = this.tracks[index]
    this.playlistSyncService.currentSongOfPlayerId = Number(this.currentTrack.id)
    localStorage.setItem('currentSong', JSON.stringify(this.currentTrack))
    localStorage.setItem('currentSongIndex', index.toString())
    this.audio.src = this.currentTrack.audio as string
    this.loadState = 'playlist-page-next'
    this.audio.load()
  }
  getIndex() {
    return this.tracks.findIndex((track) => track.id === this.currentTrack?.id)
  }





  togglePlayPauseWhenNoPageIsLoad() {
    if (this.actionPage === 'none') {
      if (!this.isPlay) {
        this.audio.play().then(() => {
          this.isPlay = true
        })
      } else {
        this.audio.pause()
        this.isPlay = false;
      }
    }
  }
  nextWhenNoPageIsLoad() {

  }
}


