import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NgxWavesurferService} from "ngx-wavesurfer";
import * as $ from "jquery";

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css']
})
export class SongComponent implements OnInit, AfterViewInit {
  isPlaying = false;
  endTime: string = '';
  waveSurfer: any
  option = {
    container: '#waveform',
    waveColor: 'white',
    progressColor: '#fc821d',
    barWidth: 2,
    height: 200,
    hideScrollbar: true,
    hideCursor: true,
    cursorColor: 'transparent'
  }

  constructor(public waveSurferService: NgxWavesurferService) {
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.waveSurfer = this.waveSurferService.create(this.option)
    this.loadAudio(this.waveSurfer, '/assets/Itsumo_nando_demo_Sprited_away_OST.mp3').then(() => {
      this.endTime = this.getDuration();
    })
    this.waveSurfer.on('finish', () => {
      this.isPlaying = false;
      $('.fit-image').trigger('click')
    })
  }

  loadAudio(wavesurfer: any, url: string) {
    return new Promise((resolve, reject) => {
      wavesurfer.on('error', reject);
      wavesurfer.on('ready', resolve);
      wavesurfer.load(url);
    });
  }

  playPause() {
    this.waveSurfer.playPause();
    this.isPlaying = this.waveSurfer.isPlaying()
  }

  getDuration() {
    let timeInSecond = this.waveSurfer.getDuration()
    let minutes = Math.floor(timeInSecond / 60);
    let second = Math.round(timeInSecond - minutes * 60);
    return minutes + ':' + second
  }
}
