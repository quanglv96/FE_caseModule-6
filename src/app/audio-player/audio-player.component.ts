import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {AudioPlayerService} from "../service/audio-player.service";
import {Songs} from "../model/Songs";
import {Observable} from "rxjs";
import * as moment from "moment";

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit {
  autoplay = true;
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
  loadState: string = 'playDetails'

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

  constructor(private audioService: AudioPlayerService) {
    this.currentTrack = JSON.parse(localStorage.getItem('currentSong') as string)
    this.streamObserver(this.currentTrack?.audio as string).subscribe();
    this.audioService.songOfBarId = +(this.currentTrack?.id as string)
    this.tracks = JSON.parse(localStorage.getItem('playlist') as string)
    this.index = Number(localStorage.getItem('currentSongIndex'))
    console.log(this.currentTrack, this.tracks, this.index)
  }
  /** Load audio when start page */
  ngOnInit() {
    this.actionSubscribe()
  }
  /** Subscribe for play song action */
  actionSubscribe() {
    this.playPauseSubscribe();
    this.fastForwardSubscribe();
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
      localStorage.setItem('currentSong', JSON.stringify(this.currentTrack))
      this.streamObserver(track.song.audio as string).subscribe();
      this.audioService.songOfBarId = +(this.currentTrack?.id as string)
      this.newPlaylistSubscribe(track.source)
    })
  }
  newPlaylistSubscribe(source: string) {
    switch (source) {
      case 'songDetails':
        this.audioService.playlistChange.subscribe(playlist => {
          this.tracks = [this.currentTrack as Songs, ...playlist];
          localStorage.setItem('playlist', JSON.stringify(this.tracks))
          this.index = 0;
          localStorage.setItem('currentSongIndex', this.index.toString())
          this.audioService.songOfBarId = +(this.currentTrack?.id as string)
        })
        break
    }
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
  /** Fill color for progress of song */
  fillProgress() {
    let input = document.querySelector('.timeline') as HTMLInputElement
    let min = +input.min;
    let max = +input.max;
    let val = +input.value;
    let percentage = (val - min) / (max - min) * 100;
    input.style.setProperty('--percentage', percentage + '%')
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
            if (this.loadState === 'next/prev') {
              this.audio.play().then(
                () => {this.isPlay = true}
              )
            }
            this.duration = this.formatTime(this.audio.duration)
            this.totalTime = this.audio.duration;
            break;
          case "playing":
            this.isPlay = true;
            break;
          case "pause":
            this.isPlay = false;
            break;
          case "timeupdate":
            this.fillProgress()
            this.currentTime = this.formatTime(this.audio.currentTime);
            this.seek = this.audio.currentTime;
            break;
          case "ended":
            this.audio.pause();
            this.isPlay = false;
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
  /** Time format */
  formatTime(time: number) {
    let format: string = "mm:ss"
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }
  /** Allow skip forward / backward */
  seekTo(event: Event) {
    let input = event.target as HTMLInputElement
    let position = Number(input.value);
    this.audio.currentTime = position;
    if (this.audioService.compareSong()) {
      this.audioService.fastForwardPos.next({source: 'bar', pos: position})
    }
  }
  /** Play / pause song */
  playPause() {
    if (this.loadingComplete) {
      if (!this.isPlay) {
        this.audio.play().then(() => {
          this.isPlay = true;
          if (this.audioService.compareSong()) {
            this.audioService.playState.next('pagePlay')
          }
        })
      } else {
        this.audio.pause();
        this.isPlay = false
        if (this.audioService.compareSong()) {
          this.audioService.playState.next('pagePause')
        }
      }
    }
  }
  /** Next / prev song */
  next() {
    if (this.index < this.tracks.length - 1) {
      this.index++
      this.nextPrevAction();
    }
  }

  private nextPrevAction() {
    this.currentTrack = this.tracks[this.index];
    this.audioService.loadStateChange.next('next/prev')
    this.audioService.songOfBarId = +(this.currentTrack?.id as string)
    this.streamObserver(this.currentTrack.audio as string).subscribe();
    if (this.audioService.compareSong()) {
      this.audioService.loadStateChange.next('playDetails')
    }
    localStorage.setItem('currentSong', JSON.stringify(this.currentTrack))
    localStorage.setItem('currentSongIndex', this.index.toString())
  }

  prev() {
    if (this.index > 0) {
      this.index--
      this.nextPrevAction();
    }
  }
}
