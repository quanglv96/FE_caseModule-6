import {Component, OnInit} from '@angular/core';
import {Track} from "ngx-audio-player";
import {AudioPlayerService} from "../service/audio-player.service";
import * as $ from 'jquery'


@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit {
  track: Track[] = []
  isPlay: boolean = false

  constructor(private audioService: AudioPlayerService) {
  }

  ngOnInit() {
    this.audioService.audioChange.subscribe(
      data => {
        this.track = data;
        console.log(data)
      }
    )
    this.audioService.playState.subscribe(
      data => {
        $('.mat-mdc-button-touch-target').trigger('click');
      }
    )
  }

  isVisible() {
    return this.track.length > 0;
  }
}
