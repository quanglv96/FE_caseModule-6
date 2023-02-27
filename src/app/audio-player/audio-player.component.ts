import {AfterViewInit, Component, OnInit} from '@angular/core';
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
export class AudioPlayerComponent implements OnInit, AfterViewInit {
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
  loadAudioState: string = 'none'
  showVolumeControl = false;
  volume: number = 0.5;

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
    "seeked"
  ];

  constructor(private audioService: AudioPlayerService,
              private playlistSyncService: PlaylistSyncService) {
    this.audio.volume = this.volume;
    this.currentTrack = JSON.parse(localStorage.getItem('currentSong') as string)
    this.streamObserver(this.currentTrack?.audio as string).subscribe();
    this.audioService.songOfBarId = +(this.currentTrack?.id as string)
    this.playlistSyncService.currentSongIdOfPlayer = +(this.currentTrack?.id as string)
    this.tracks = JSON.parse(localStorage.getItem('playlist') as string)
    this.index = Number(localStorage.getItem('currentSongIndex'))
    this.audioService.playlistOfBarId = Number(localStorage.getItem('playlistId') as string)
    this.playlistSyncService.currentPLIdOfPlayer = Number(localStorage.getItem('playlistId') as string)
  }
  /** Subscribe event when start page */
  ngOnInit() {
    this.actionSubscribe()
    this.subscribeEventFromPLPage()
  }

  ngAfterViewInit() {
    this.fillVolume()
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
            this.playlistSyncService.isPlayerPlaying = true;
          })
        } else if (data === 'barPause') {
          this.audio.pause();
          this.isPlay = false;
          this.playlistSyncService.isPlayerPlaying = false;
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
        this.loadAudioState = data;
      }
    )
  }
  /** Stream object for audio and support */
  streamObserver(url: string) {
    return new Observable(observer => {
      this.audio.src = url
      this.audio.load()
      const handler = (event: Event) => {
        switch (event.type) {
          case "canplaythrough":
            this.handleLoadAudioComplete()
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
            this.playlistSyncService.playerCurrentTime = this.audio.currentTime
            break;
          case "ended":
            this.next()
            break;
          case "seeked":
            sessionStorage.setItem('player-time', this.audio.currentTime.toString())
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
  addEvent(obj: HTMLAudioElement, events: string[], handler: any) {
    events.forEach((event) => {
      obj.addEventListener(event, handler);
    })
  }
  removeEvent(obj: HTMLAudioElement, events: string[], handler: any) {
    events.forEach((event) => {
      obj.removeEventListener(event, handler);
    })
  }
  handleLoadAudioComplete() {
    this.loadingComplete = true;
    this.audioService.loadSongOfBarChange.next(this.loadAudioState);
    this.duration = this.formatTime(this.audio.duration)
    this.totalTime = this.audio.duration;
    switch (this.loadAudioState) {
      case 'playlist-first-play':
      case 'player-load-on-next-complete':
      case 'load-complete-on-navigate-song':
        this.audio.play().then(() => {
          this.isPlay = true
          this.playlistSyncService.isPlayerPlaying = true;
          this.playlistSyncService.onPlayPauseToggle.next('player-played-on-navigate')
        })
        break;
      case 'next':
        this.audio.play().then(() => {
          this.isPlay = true
          this.playlistSyncService.isPlayerPlaying = true;
        })
        break;
    }
  }

    /** General action */
  playPause() {
    this.playPausePLPage();
    if (this.actionPage === 'none') {
      this.normalPlayPause()
    }
  }
  next() {
    this.audio.pause();
    this.isPlay = false;
    this.nextSongPLPage()
    if (this.actionPage === 'none') {
      this.normalNext()
    }
  }
  prev() {
    this.audio.pause();
    this.isPlay = false;
    this.prevSongPLPage()
    if (this.actionPage === 'none') {
      this.normalPrev()
    }
  }
  navigate(index: number) {
    this.navigateAtPLPage(index)
    if (this.actionPage === 'none') {
      this.normalNavigate(index)
    }
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
    if (this.playlistSyncService.compareSong() && this.playlistSyncService.comparePlaylist()) {
      this.playlistSyncService.onFastForwardSong.next({source: 'player', pos: position})
    }
  }
  controlVolume(event: Event) {
    let input = event.target as HTMLInputElement
    this.audio.volume = Number(input.value)
    this.fillVolume()
  }

  /** Playlist page */

  /** Event */
  subscribeEventFromPLPage() {
    this.onPLPageLoadingComplete()
    this.onPLPageTogglePlayPause()
    this.onPLPageChange()
    this.onResponseCurrentTime()
    this.onPLPageFastForward()
    this.onPLPageStartPlay()
  }
  onPLPageLoadingComplete() {
    this.playlistSyncService.onPLPageLoadingComplete.subscribe(
      data => {
        if (data.state === 'navigate-song') {
          this.currentTrack = data.data[0] as Songs
          this.tracks = data.data[1].songsList
          localStorage.setItem('playlistId', JSON.stringify(data.data[1].id))
          localStorage.setItem('playlist', JSON.stringify(this.tracks))
          localStorage.setItem('currentSong', JSON.stringify(this.currentTrack))
          this.playlistSyncService.currentSongIdOfPlayer = Number(this.currentTrack.id)
          this.playlistSyncService.currentPLIdOfPlayer = data.data[1].id
          this.audio.src = this.currentTrack.audio as string
          this.loadAudioState = 'load-complete-on-navigate-song'
          this.audio.load()
        }
      }
    )
  }
  onPLPageTogglePlayPause() {
    this.playlistSyncService.onPlayPauseToggle.subscribe(
      data => {
        if (data === 'pl-page-play')
        this.audio.play().then(() => {
          this.isPlay = true
          this.playlistSyncService.isPlayerPlaying = true;
        })
        if (data === 'pl-page-pause') {
          this.audio.pause()
          this.isPlay = false
          this.playlistSyncService.isPlayerPlaying = false;
        }
      }
    )
  }
  onPLPageStartPlay() {
    this.playlistSyncService.onPLPageStartPlay.subscribe(
      data => {
        if (data === 'pl-play-when-player-toggle-play')
          this.audio.play().then(() => {
            this.isPlay = true
            this.playlistSyncService.isPlayerPlaying = true;
        })
      }
    )
  }
  onPLPageChange() {
    this.playlistSyncService.onPageChange.subscribe(
      data => {this.actionPage = data}
    )
  }
  onResponseCurrentTime() {
    this.playlistSyncService.onRequestCurrentTime.subscribe(
      data => {
        if (data.action === 'request-current-time-of-player') {
          let currentTime = this.audio.currentTime
          this.playlistSyncService.onResponseCurrentTime.next(
            {action: 'response-current-time-from-player', pos: currentTime}
          )
        }
      }
    )
  }
  onPLPageFastForward() {
    this.playlistSyncService.onFastForwardSong.subscribe(
      data => {
        if (data.source === 'pl-page') {
          this.audio.currentTime = data.pos
        }
      }
    )
  }

  /** Action */
  playPausePLPage() {
    if (this.actionPage === 'playlist') {
      if (this.playlistSyncService.comparePlaylist()) {
        this.playPauseIfSamePlaylist()
      } else {
        this.normalPlayPause()
      }
    }
  }
  playPauseIfSamePlaylist() {
    if (!this.playlistSyncService.isPLPageStartLoading && !this.isPlay) {
      this.playPLWhenPLPageIsNotPlaying()
    } else {
      this.playPauseWithPLPage()
    }
  }
  playPLWhenPLPageIsNotPlaying() {
    let index = this.getIndex()
    this.currentTrack = this.tracks[index]
    let currentTime = this.audio.currentTime;
    this.playlistSyncService.onNavigateToSong.next({desc: 'play-when-pl-page-is-not-play', data: [this.currentTrack, currentTime]})
  }
  playPauseWithPLPage() {
    if (this.playlistSyncService.isPLPageLoadComplete) {
      if (this.isPlay) {
        this.audio.pause()
        this.isPlay = false;
        this.playlistSyncService.isPlayerPlaying = false
        this.playlistSyncService.onPlayPauseToggle.next('player-pause')
      } else {
        this.audio.play().then(() => {
          this.isPlay = true;
          this.playlistSyncService.isPlayerPlaying = true
          this.playlistSyncService.onPlayPauseToggle.next('player-play')
        })
      }
    }
  }

  nextSongPLPage() {
    if (this.actionPage === 'playlist') {
      if (this.playlistSyncService.comparePlaylist()) {
        this.nextSongOnCurrentPlaylist()
      } else {
        this.nextSongOnOtherPlaylist()
      }
    }
  }
  nextSongOnCurrentPlaylist() {
    let index = this.getIndex()
    if (this.loopMode === 'one') {
      this.audio.currentTime = 0;
      this.playlistSyncService.onFastForwardSong.next({source: 'player', pos: 0})
    } else if (this.playMode === 'auto') {
      this.nextSongOnCurrentPlaylistAutoMode(index)
    } else if (this.playMode == 'shuffle') {
      if (this.indexArr.length < this.tracks.length - 1) {
        this.indexArr.push(index)
        this.nextSongOnCurrentPlaylistShuffleMode()
      } else {
        if (this.loopMode == 'loop') {
          this.indexArr = []
          this.nextSongOnCurrentPlaylistShuffleMode()
        }
      }
    }
  }
  nextSongOnCurrentPlaylistAutoMode(index: number) {
    if (index < this.tracks.length - 1) {
      index++
      this.currentTrack = this.tracks[index]
      this.moveToSongPLPage(index)
    } else {
      if (this.loopMode === 'loop') {
        index = 0;
        this.moveToSongPLPage(index)
      }
    }
  }
  nextSongOnCurrentPlaylistShuffleMode() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.tracks.length)
    } while (this.indexArr.includes(newIndex))
    this.moveToSongPLPage(newIndex)
  }
  nextSongOnOtherPlaylist() {
    this.normalNext()
  }

  prevSongPLPage() {
    if (this.actionPage === 'playlist') {
      if (this.playlistSyncService.comparePlaylist()) {
        this.prevSongOnCurrentPlaylist()
      } else {
        this.prevSongOnOtherPlaylist()
      }
    }
  }
  prevSongOnCurrentPlaylist() {
    let index = this.getIndex()
    if (this.loopMode === 'one') {
      this.audio.currentTime = 0;
      this.playlistSyncService.onFastForwardSong.next({source: 'player', pos: 0})
    } else if (this.playMode === 'auto') {
      this.prevSongOnCurrentPlaylistAutoMode(index)
    } else if (this.playMode == 'shuffle') {
      this.prevSongOnCurrentPlaylistShuffleMode()
    }
  }
  prevSongOnCurrentPlaylistAutoMode(index: number) {
    if (index > 0) {
      index--
      this.currentTrack = this.tracks[index]
      this.moveToSongPLPage(index)
    } else {
      if (this.loopMode === 'loop') {
        index = this.tracks.length - 1;
        this.moveToSongPLPage(index)
      }
    }
  }
  prevSongOnCurrentPlaylistShuffleMode() {
    if (this.indexArr.length === 0) {
      this.playMode = 'auto'
      let index = this.getIndex()
      this.prevSongOnCurrentPlaylistAutoMode(index)
    } else {
      let index = this.indexArr[this.indexArr.length - 1]
      this.moveToSongPLPage(index)
      this.indexArr.pop()
      if (this.indexArr.length === 0) {
        this.playMode = 'auto'
      }
    }
  }
  prevSongOnOtherPlaylist() {
    this.normalPrev()
  }

  navigateAtPLPage(index: number) {
    if (this.actionPage === 'playlist') {
      if (this.playlistSyncService.comparePlaylist()) {
        if (!this.checkIndex(index)) {
          this.moveToSongPLPage(index)
        }
      } else {
        this.normalNavigate(index)
      }
    }
  }
  moveToSongPLPage(index: number) {
    this.currentTrack = this.tracks[index]
    this.playlistSyncService.onNavigateToSong.next({desc: 'next-song', data: this.currentTrack})
  }








  /** Util method */
  normalPlayPause() {
    if (this.isPlay) {
      this.audio.pause()
      this.isPlay = false;
      this.playlistSyncService.isPlayerPlaying = false
    } else {
      this.audio.play().then(() => {
        this.isPlay = true;
        this.playlistSyncService.isPlayerPlaying = true
      })
    }
  }
  normalNext() {
    let index = this.getIndex()
    if (this.loopMode === 'one') {
      this.audio.currentTime = 0;
    } else if (this.playMode === 'auto') {
      this.normalNextAutoMode(index)
    } else if (this.playMode == 'shuffle') {
      if (this.indexArr.length < this.tracks.length - 1) {
        this.indexArr.push(index)
        console.log(this.indexArr)
        this.normalNextShuffleMode()
      } else {
        if (this.loopMode == 'loop') {
          this.indexArr = []
          this.normalNextShuffleMode()
        }
      }
    }
  }
  normalNextAutoMode(index: number) {
    if (index < this.tracks.length - 1) {
      index++
      this.normalMoveToSong(index)
    } else {
      if (this.loopMode === 'loop') {
        index = 0
        this.normalMoveToSong(index)
      }
    }
  }
  normalNextShuffleMode() {
    let index;
    do {
      index = Math.floor(Math.random() * this.tracks.length)
    } while (this.indexArr.includes(index))
    this.normalMoveToSong(index)
  }
  normalPrev() {
    let index = this.getIndex()
    if (this.loopMode === 'one') {
      this.audio.currentTime = 0;
    } else if (this.playMode === 'auto') {
      this.normalPrevAutoMode(index)
    } else if (this.playMode == 'shuffle') {
      this.normalPrevShuffleMode()
    }
  }
  normalPrevAutoMode(index: number) {
    if (index > 0) {
      index--
      this.normalMoveToSong(index)
    } else {
      if (this.loopMode === 'loop') {
        index = this.tracks.length - 1
        this.normalMoveToSong(index)
      }
    }
  }
  normalPrevShuffleMode() {
    if (this.indexArr.length === 0) {
      let index = this.getIndex()
      this.normalPrevAutoMode(index)
    } else {
      let index = this.indexArr[this.indexArr.length - 1]
      this.normalMoveToSong(index)
      this.indexArr.pop()
      if (this.indexArr.length === 0) {
        this.playMode = 'auto'
      }
    }
  }
  normalNavigate(i: number) {
    if (!this.checkIndex(i)) {
      this.normalMoveToSong(i)
    }
  }
  normalMoveToSong(i: number) {
    this.currentTrack = this.tracks[i];
    this.audio.src = this.currentTrack.audio as string
    this.loadAudioState = 'next'
    this.audio.load()
    this.saveToStorage()
  }

  saveToStorage() {
    localStorage.setItem('currentSong', JSON.stringify(this.currentTrack))
  }
  fillProgress() {
    let input = document.querySelector('.timeline') as HTMLInputElement
    let min = +input.min;
    let max = +input.max;
    let val = +input.value;
    let percentage = (val - min) / (max - min) * 100;
    input.style.setProperty('--percentage', percentage + '%')
  }
  fillVolume() {
    let input = document.querySelector('.volume-controls__input') as HTMLInputElement
    let percentage = +input.value / +input.max * 100;
    input.style.setProperty('--volPercentage', percentage + '%')
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
    return this.getIndex() === i
  }
  getIndex() {
    return this.tracks.findIndex(track => track.id === this.currentTrack?.id)
  }
  toggleVolumeControl() {
    this.showVolumeControl = !this.showVolumeControl
  }


}


