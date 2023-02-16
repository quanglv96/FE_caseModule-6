import {Component, OnInit} from '@angular/core';
import {Playlist} from "../model/Playlist";
import {PlaylistService} from "../service/playlist/playlist.service";
import {NgxWavesurferService} from "ngx-wavesurfer";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {User} from "../model/User";
import {UserService} from "../service/user/user.service";
import * as $ from 'jquery'
import {CanComponentDeactivate} from "../service/can-deactivate";

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit, CanComponentDeactivate {
  playlist?: Playlist;
  playlistId?: number
  userId?: number
  user?: User
  wavesurfer: any
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
  isStartPlaying = false;
  isPlaying = false;
  endTime: string = '';

  constructor(private playlistService: PlaylistService,
              public waveSurferService: NgxWavesurferService,
              private route: ActivatedRoute,
              private userService: UserService) {
  }

  ngOnInit() {
    // @ts-ignore
    this.userId = localStorage.getItem('idUser');
    if (!!this.userId) {
      this.userService.getUser(+this.userId).subscribe(
        data => {this.user = data}
      )
    }
    this.playlistId = +this.route.snapshot.params['id']
    this.playlistService.findPlaylistById(this.playlistId).subscribe(
      data => {this.playlist = data}
    )
    this.route.params.subscribe(
      (params: Params) => {
        this.playlistId = +params['id']
        this.playlistService.findPlaylistById(this.playlistId).subscribe(
          data => {
            this.playlist = data
            this.isStartPlaying = false;
            this.isPlaying = false
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
    this.loadAudio(this.wavesurfer, this.playlist?.songsList[i].audio).then(
      () => {
        this.endTime = this.getDuration();
        this.wavesurfer.playPause();
        this.isPlaying = this.wavesurfer.isPlaying()
        $('.p-avt').trigger('click')
      }
    )
    this.wavesurfer.on('finish', () => {
      // @ts-ignore
      if (i < this.playlist?.songsList?.length - 1) {
        this.load(i + 1);
      }
    })
  }

  loadAudio(wavesurfer: any, url: string | undefined) {
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
    this.wavesurfer.destroy();
    this.wavesurfer = undefined
    return true;
  }
}
