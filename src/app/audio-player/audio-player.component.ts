import {AfterViewInit, Component, OnInit} from '@angular/core';
import {SongSyncService} from "../service/song-sync.service";
import {Songs} from "../model/Songs";
import {Observable} from "rxjs";
import * as moment from "moment";
import {PlaylistSyncService} from "../playlist-sync.service";
import {LibrarySyncService} from "../service/library-sync.service";

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
  isVisible: boolean = true

  constructor(private songSyncService: SongSyncService,
              private playlistSyncService: PlaylistSyncService,
              private librarySyncService: LibrarySyncService) {
    this.audio.volume = this.volume;
    this.currentTrack = JSON.parse(localStorage.getItem('currentSong') as string)
    this.tracks = JSON.parse(localStorage.getItem('playlist') as string)
    this.streamObserver(this.currentTrack?.audio as string).subscribe();
    this.isVisible = !!this.currentTrack
  }

  onLibraryPageChange() {
    this.librarySyncService.onPageChange.subscribe(
      data => {
        console.log(data)
        this.actionPage = data
        if ((this.actionPage === 'library' || this.actionPage === 'search')) {
          this.isVisible = false;
          this.audio.pause()
          this.isPlay = false;
          this.assignPlayingStateToService()
        } else {
          this.isVisible = !!this.currentTrack
        }
      }
    )
  }
  onVisibleChange() {
    this.librarySyncService.onVisible.subscribe(
      data => {this.isVisible = data}
    )
  }

  /** Subscribe event when start page */
  ngOnInit() {
    this.subscribeEventFromPLPage()
    this.subscribeEventFromSongPage()
    this.onLibraryPageChange()
    this.onVisibleChange()
  }

  ngAfterViewInit() {
    this.fillVolume()
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
            this.assignPlayingStateToService()
            break;
          case "pause":
            this.isPlay = false;
            this.assignPlayingStateToService()
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
        this.assignPlayingStateToService()
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
    this.duration = this.formatTime(this.audio.duration)
    this.totalTime = this.audio.duration;
    switch (this.loadAudioState) {
      case 'playlist-first-play':
      case 'player-load-on-next-complete':
      case 'load-complete-on-navigate-song':
        this.audio.play().then(() => {
          this.isPlay = true
          this.assignPlayingStateToService()
          this.playlistSyncService.onPlayPauseToggle.next('player-played-on-navigate')
        })
        break;
      case 'next':
        this.audio.play().then(() => {
          this.isPlay = true
          this.assignPlayingStateToService()
        })
        break;
      case 'load-song-of-song-page':
        this.audio.play().then(() => {
          this.songSyncService.onPlayPause.next('player-play-on-song-page-start-play')
          this.isPlay = true
          this.assignPlayingStateToService()
        })
        break
      case 'navigate-on-page-song':
        this.songSyncService.onNavigateSong.next({state: 'navigate-on-page-song', data: this.currentTrack})
        break;
    }
  }
    /** General action */
  playPause() {
    this.playPausePLPage();
    this.playPauseSongPage()
    if (this.actionPage === 'none') {
      this.normalPlayPause()
    }
  }
  next() {
    this.audio.pause();
    this.assignPlayingStateToService()
    this.isPlay = false;
    switch (this.actionPage) {
      case 'playlist':
        this.nextSongPLPage()
        break;
      case 'song-page':
        this.nextSongPage()
        break;
      case 'none':
        this.normalNext()
        break
    }
  }
  prev() {
    this.audio.pause();
    this.isPlay = false;
    this.assignPlayingStateToService()
    switch (this.actionPage) {
      case 'playlist':
        this.prevSongPLPage()
        break;
      case 'song-page':
        this.prevSongPage()
        break;
      case 'none':
        this.normalPrev()
        break
    }
  }
  navigate(index: number) {
    console.log(this.actionPage)
    this.navigateAtPLPage(index)
    this.navigateAtSongPage(index)
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
    if (this.songSyncService.compareSong()) {
      this.songSyncService.onFastForwardSong.next({source: 'player', pos: position})
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
  /** Default action */
  normalPlayPause() {
    if (this.isPlay) {
      this.audio.pause()
      this.isPlay = false;
      this.assignPlayingStateToService()
    } else {
      this.audio.play().then(() => {
        this.isPlay = true;
        this.assignPlayingStateToService()
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
    this.songSyncService.songOfPlayerId = Number(this.currentTrack.id)
    this.audio.src = this.currentTrack.audio as string
    this.loadAudioState = 'next'
    this.audio.load()
    this.saveToStorage()
  }
  /** Util method */
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
  assignPlayingStateToService() {
    this.songSyncService.isPlayerPlaying = this.isPlay
    if (!!this.tracks) {
      this.playlistSyncService.isPlayerPlaying = this.isPlay
    }
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
          this.assignPlayingStateToService()
        })
        if (data === 'pl-page-pause') {
          this.audio.pause()
          this.isPlay = false
          this.assignPlayingStateToService()
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
            this.assignPlayingStateToService()
        })
      }
    )
  }
  onPLPageChange() {
    this.playlistSyncService.onPageChange.subscribe(
      data => {
        console.log(data)
        this.actionPage = data
        this.playlistSyncService.currentSongIdOfPlayer = +(this.currentTrack?.id as string)
        this.playlistSyncService.currentPLIdOfPlayer = Number(localStorage.getItem('playlistId') as string)
        if ((this.actionPage === 'library' || this.actionPage === 'search')) {
          this.isVisible = false;
          this.audio.pause()
          this.isPlay = false;
          this.assignPlayingStateToService()
        } else {
          this.isVisible = !!this.currentTrack
        }
      }
    )
  }
  onResponseCurrentTime() {
    this.playlistSyncService.onRequestCurrentTime.subscribe(
      data => {
        if (data.action === 'request-current-time-of-player' && this.actionPage === 'playlist') {
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
  // Play
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
        this.assignPlayingStateToService()
        this.playlistSyncService.onPlayPauseToggle.next('player-pause')
      } else {
        this.audio.play().then(() => {
          this.isPlay = true;
          this.assignPlayingStateToService()
          this.playlistSyncService.onPlayPauseToggle.next('player-play')
        })
      }
    }
  }
  // Next
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
  // Prev
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
  // Navigate
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

  /** Song page */

  /** Event */
  subscribeEventFromSongPage() {
    this.onSongChangeSongPage()
    this.onPlayPauseSongPage()
    this.onSongPageFastForward()
    this.onSongPageRequestCurrentTime()
    this.onSongPageResponseCurrentTime()
    this.onSongPageChange()
    this.onNavigateToSameSongWithPage()
  }
  onSongChangeSongPage() {
    this.songSyncService.onSongChange.subscribe(
      data => {
        this.currentTrack = data.song
        this.tracks = data.suggest
        this.songSyncService.songOfPlayerId = Number(this.currentTrack.id)
        localStorage.setItem('currentSong', JSON.stringify(this.currentTrack))
        localStorage.setItem('playlist', JSON.stringify(this.tracks))
        localStorage.setItem('playlistId', JSON.stringify(null))
        this.audio.src = this.currentTrack?.audio as string
        this.loadAudioState = 'load-song-of-song-page'
        this.audio.load()
      }
    )
  }
  onPlayPauseSongPage() {
    this.songSyncService.onPlayPause.subscribe(
      data => {
        if (data === 'song-page-play') {
          this.audio.play().then(() => {
            this.isPlay = true
            this.assignPlayingStateToService()
            return;
          })
        }
        if (data === 'song-page-pause') {
          this.audio.pause();
          this.isPlay = true
          this.assignPlayingStateToService()
          return;
        }
        if (data === 'navigate-on-page-song') {
          this.audio.play().then(() => {
            this.isPlay = true
            this.assignPlayingStateToService()
            return;
          })
        }
        if (data === 'navigate-on-page-song-with-same-song') {
          this.audio.play().then(() => {
            this.isPlay = true
            this.assignPlayingStateToService()
            return;
          })
        }
      }
    )
  }
  onSongPageFastForward() {
    this.songSyncService.onFastForwardSong.subscribe(
      data => {
        if (data.source === 'song-page' && this.songSyncService.compareSong()) {
          this.audio.currentTime = data.pos
        }
      }
    )
  }
  onSongPageRequestCurrentTime() {
    this.songSyncService.onRequestCurrentTime.subscribe(
      data => {
        if (data === 'song-page-request-time') {
          this.tracks = JSON.parse(localStorage.getItem('playlist') as string)
          this.songSyncService.onResponseCurrentTime.next(
            {desc: 'player-response-song-page-current-time', pos: this.audio.currentTime}
          )
        }
        if (data === 'current-time-of-player-when-page-start' && this.audio.currentTime > 0) {
          this.songSyncService.onResponseCurrentTime.next(
            {desc: 'current-time-of-player-when-page-start', pos: this.audio.currentTime}
          )
        }
      }
    )
  }
  onSongPageResponseCurrentTime() {
    this.songSyncService.onResponseCurrentTime.subscribe(
      data => {
        if (data.desc === 'current-time-of-song-page-when-start-playing') {
          this.audio.currentTime = data.pos
          this.audio.play().then(() => {
            this.isPlay = true
            this.assignPlayingStateToService()
          })
        }
      }
    )
  }
  onSongPageChange() {
    this.songSyncService.onPageChange.subscribe(
      data => {
        console.log(data)
        this.actionPage = data
        this.songSyncService.songOfPlayerId = +(this.currentTrack?.id as string)
        if ((this.actionPage === 'library' || this.actionPage === 'search')) {
          this.isVisible = false;
          this.audio.pause()
          this.isPlay = false;
          this.assignPlayingStateToService()
        } else {
          this.isVisible = !!this.currentTrack
        }
      }
    )
  }
  onNavigateToSameSongWithPage() {
    this.songSyncService.onNavigateSong.subscribe(
      data => {
        if (data.state === 'navigate-on-same-song-with-page') {
          this.audio.play().then(() => {
            this.isPlay = true
            this.assignPlayingStateToService()
            this.songSyncService.onPlayPause.next('navigate-on-same-song-with-page')
            return;
          })
        }
      }
    )
  }
  /** Action */
  // Play
  playPauseSongPage() {
    if (this.actionPage === 'song-page') {
      if (this.songSyncService.compareSong()) {
        this.playPauseSongPageWhenSameSong()
      } else {
        this.normalPlayPause()
      }
    }
  }
  playPauseSongPageWhenSameSong() {
    if (this.isPlay) {
      this.audio.pause()
      this.isPlay = false;
      this.assignPlayingStateToService()
      this.songSyncService.onPlayPause.next('player-pause')
    } else {
      this.audio.play().then(() => {
        this.isPlay = true;
        this.assignPlayingStateToService()
        this.songSyncService.onPlayPause.next('player-play')
      })
    }
  }
  // Next
  nextSongPage() {
    if (this.actionPage === 'song-page') {
      this.nextSongPageOnSameSong()
    } else {
      this.normalNext()
    }
  }
  nextSongPageOnSameSong() {
    let index = this.getIndex()
    if (this.loopMode === 'one') {
      this.nextSongPageLoopOneMode()
    } else if (this.playMode === 'auto') {
      this.nextSongPageAutoMode(index)
    } else if (this.playMode == 'shuffle') {
      if (this.indexArr.length < this.tracks.length - 1) {
        this.indexArr.push(index)
        this.nextSongPageShuffleMode()
      } else {
        if (this.loopMode == 'loop') {
          this.indexArr = []
          this.nextSongPageShuffleMode()
        }
      }
    }
  }
  nextSongPageLoopOneMode() {
    this.audio.currentTime = 0;
    this.songSyncService.onNavigateSong.next({state: 'next-song-page-loop-one', data: this.currentTrack})
    this.audio.play().then(() => {
      this.isPlay = true
      this.assignPlayingStateToService()
      return;
    })
  }
  nextSongPageAutoMode(index: number) {
    if (index < this.tracks.length - 1) {
      index++
      this.moveToSongOnSongPage(index)
    } else {
      if (this.loopMode === 'loop') {
        index = 0
        this.moveToSongOnSongPage(index)
      }
    }
  }
  nextSongPageShuffleMode() {
    let index;
    do {
      index = Math.floor(Math.random() * this.tracks.length)
    } while (this.indexArr.includes(index))
    this.moveToSongOnSongPage(index)
  }
  // Prev
  prevSongPage() {
    if (this.actionPage === 'song-page') {
      this.prevSongPageOnSameSong()
    } else {
      this.normalPrev()
    }
  }
  prevSongPageOnSameSong() {
    let index = this.getIndex()
    if (this.loopMode === 'one') {
      this.prevSongPageLoopOneMode()
    } else if (this.playMode === 'auto') {
      this.prevSongPageAutoMode(index)
    } else if (this.playMode == 'shuffle') {
      this.prevSongPageShuffleMode()
    }
  }
  prevSongPageLoopOneMode() {
    this.audio.currentTime = 0;
    this.songSyncService.onNavigateSong.next({state: 'next-song-page-loop-one', data: this.currentTrack})
    this.audio.play().then(() => {
      this.isPlay = true
      this.assignPlayingStateToService()
      return;
    })
  }
  prevSongPageAutoMode(index: number) {
    if (index > 0) {
      index--
      this.moveToSongOnSongPage(index)
    } else {
      if (this.loopMode === 'loop') {
        index = this.tracks.length - 1
        this.moveToSongOnSongPage(index)
      }
    }
  }
  prevSongPageShuffleMode() {
    if (this.indexArr.length === 0) {
      this.playMode = 'auto'
      let index = this.getIndex()
      this.prevSongPageAutoMode(index)
    } else {
      let index = this.indexArr[this.indexArr.length - 1]
      this.moveToSongOnSongPage(index)
      this.indexArr.pop()
      if (this.indexArr.length === 0) {
        this.playMode = 'auto'
      }
    }
  }
  // Navigate
  navigateAtSongPage(index: number) {
    if (this.actionPage === 'song-page') {
      if (!this.checkIndex(index)) {
        this.moveToSongOnSongPage(index)
      }
    }
  }
  moveToSongOnSongPage(index: number) {
    this.currentTrack = this.tracks[index]
    this.songSyncService.songOfPlayerId = Number(this.currentTrack.id)
    this.assignPlayingStateToService()
    this.loadAudioState = 'navigate-on-page-song'
    this.audio.src = this.currentTrack.audio as string
    this.audio.load()
    this.saveToStorage()
  }
}


