import {Component, OnInit} from '@angular/core';
import * as $ from "jquery";
import {NgxWavesurferService} from "ngx-wavesurfer";
import {Songs} from "../model/Songs";
import {SingerService} from "../service/singer/singer.service";
import {ActivatedRoute, Params} from "@angular/router";
import {CanComponentDeactivate} from "../service/can-deactivate";
import {Singer} from "../model/Singer";
import {data} from "jquery";

@Component({
  selector: 'app-singer',
  templateUrl: './singer.component.html',
  styleUrls: ['./singer.component.css']
})
export class SingerComponent implements OnInit, CanComponentDeactivate {
  singer?: Singer
  isPlaying = false
  isStartPlaying = false;
  wavesurfer: any
  songPlay?: string = '';
  songUser?: string = '';
  option = {
    container: '#waveform',
    waveColor: 'white',
    progressColor: '#fc821d',
    barWidth: 2,
    height: 110,
    hideScrollbar: true,
    hideCursor: true,
    cursorColor: 'transparent'
  }
  endTime: string = '';
  songLists: Songs[] = []
  singerId: number | undefined

  constructor(private waveSurferService: NgxWavesurferService,
              private singerService: SingerService,
              private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.singerId = +params['id']
        this.singerService.getSinger(this.singerId).subscribe(
          data => {
            this.singer = data
          }
        )
        this.singerService.getSongs(this.singerId).subscribe(
          data => {
            this.songLists = data;
          }
        )
      }
    )

  }

  playPause() {
    if (this.wavesurfer === undefined) {
      this.loadSong(0)
    } else {
      this.wavesurfer.playPause();
      this.isPlaying = this.wavesurfer.isPlaying();
    }
  }

  sendComment() {

  }

  loadSong(i: number) {
    this.load(i)
  }

  load(i: number) {
    if (!!this.wavesurfer) {
      this.wavesurfer.destroy();
    }
    this.isStartPlaying = true
    this.wavesurfer = this.waveSurferService.create(this.option)
    // @ts-ignore
    this.loadAudio(this.wavesurfer, this.songLists[i]?.audio).then(
      () => {
        // @ts-ignore
        this.songPlay = this.songLists[i]?.name;
        // @ts-ignore
        this.songUser = this.songLists[i].users.name
        this.endTime = this.getDuration();
        this.wavesurfer.playPause();
        this.isPlaying = this.wavesurfer.isPlaying()
        $('.singer-avt').trigger('click')
      }
    )
    this.wavesurfer.on('finish', () => {
      // @ts-ignore
      if (i < this.songLists.length - 1) {
        this.load(i + 1);
      } else {
        this.isPlaying = false;
        $('.singer-avt').trigger('click')
      }
    })
  }

  loadAudio(wavesurfer: any, url: string | any) {
    return new Promise((resolve, reject) => {
      wavesurfer.on('error', reject);
      wavesurfer.on('ready', resolve);
      wavesurfer.load(url);
    });
  }

  getDuration() {
    let timeInSecond = this.wavesurfer.getDuration()
    let minutes = Math.floor(timeInSecond / 60);
    let second = Math.round(timeInSecond - minutes * 60);
    return minutes + ':' + second
  }

  canDeactivate() {
    if (this.wavesurfer !== undefined) {
      this.wavesurfer.destroy()
    }
    this.wavesurfer = undefined
    return true;
  }
}
