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
    this.waveSurfer.load('/assets/Futari_no_kimochi_Inuyasha_OST.mp3')
    this.waveSurfer.on('finish', () => {
      this.isPlaying = false;
      $('.fit-image').trigger('click')
    })
  }

  playPause() {
    this.waveSurfer.playPause();
    this.isPlaying = this.waveSurfer.isPlaying()
  }
}
