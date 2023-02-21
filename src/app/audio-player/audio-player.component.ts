import {AfterContentInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as $ from 'jquery'
import {AudioPlayerService} from "../service/audio-player.service";
import {AngMusicPlayerComponent} from "ang-music-player";
import {Songs} from "../model/Songs";

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit, AfterContentInit {
  tracks: Songs[] = []
  currentTrack?: Songs
  isPlay: boolean = false
  @ViewChild('audioPlayer', { static: false }) audioPlayer?: ElementRef;
  audio?: HTMLMediaElement;

  constructor(private audioService: AudioPlayerService) {

  }

  ngOnInit() {
    this.audioService.audioChange.subscribe(
      data => {
        this.tracks = data;
        this.currentTrack = data[0]
        console.log(this.currentTrack)
      }
    )
    this.audioService.playState.subscribe(
      data => {
        this.isPlay = true
      }
    )
  }

  play() {
    this.audio?.play().finally();
  }

  ngAfterContentInit() {
    this.audio = this.audioPlayer?.nativeElement;
    if (this.audio) {
      this.audio.volume = 1.0;
      this.audio.autoplay = false;
    }
  }

  isVisible() {
    return this.tracks.length > 0 && this.isPlay;
  }
}
