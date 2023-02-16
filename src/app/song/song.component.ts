import { Component, OnInit, Input} from '@angular/core';
import {NgxWavesurferService} from "ngx-wavesurfer";
import * as $ from "jquery";
import {CanComponentDeactivate} from "../service/can-deactivate";
import {ActivatedRoute, Router, ParamMap} from "@angular/router";
import {SongsService} from "../service/songs/songs.service";
import {Songs} from "../model/Songs";

import {Comments} from "../model/Comments";
import {UserService} from "../service/user/user.service";
import {User} from "../model/User";

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css']
})
export class SongComponent implements OnInit, CanComponentDeactivate {
  isPlaying = false;
  endTime: string = '';
  waveSurfer: any;
  url: string | undefined;
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
  songs: Songs = {};
  listComment: Comments[] = []
  stringTag: string = "";
  user: User = {}
  @Input() contentComment: string = "";
  suggestSongs: Songs[] = []
  statusLike: boolean = false;

  constructor(public waveSurferService: NgxWavesurferService,
              private router: Router,
              private route: ActivatedRoute,
              private songService: SongsService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.songService.findSongById(paramMap.get('id')).subscribe((song: Songs) => {
        this.songs = song;
        // this.url = song.audio;
        this.url = 'https://firebasestorage.googleapis.com/v0/b/quanglv-ca07a.appspot.com/o/image%2FBuongTay-KhoiMyLaThang-3128968.mp3?alt=media&token=3592ac19-1dda-4c4b-acdf-2dca77ef2c73'
        this.renderAudioOnStart()
        // @ts-ignore
        for (let i = 0; i < song.tagsList?.length; i++) {
          // @ts-ignore
          this.stringTag += song.tagsList[i].name + " ";
        }
        // @ts-ignore
        this.songService.getCommentSong(this.songs.id).subscribe((comment: Comments[]) => {
          this.listComment = comment
          // @ts-ignore
          this.userService.findById(localStorage.getItem('idUser')).subscribe((user: User) => {
            this.user = user as User;
            if (this.songs.userLikeSong?.find(id => id.id == this.user.id)) {
              this.statusLike = true;
            }
            // @ts-ignore
            this.songService.getSuggest5Songs().subscribe((data: Songs[]) => {
              this.suggestSongs = data;
            })
          })
        })
      })
    })
  }

  renderAudioOnStart() {
    this.waveSurfer = this.waveSurferService.create(this.option)
    console.log(this.url)
    this.loadAudio(this.waveSurfer, this.url).then(() => {
      this.endTime = this.getDuration();
    }).catch((error) => {
      console.log(error)})
    this.waveSurfer.on('finish', () => {
      this.isPlaying = false;
      $('.fit-image').trigger('click')
    })
  }

  loadAudio(wavesurfer: any, url: string | undefined) {
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

  sendComment() {
    const comment = {
      content: this.contentComment,
      users: this.user,
      songs: this.songs
    }
    this.songService.saveComment(comment).subscribe(() => {
      this.contentComment = '';
      // @ts-ignore
      this.songService.getCommentSong(this.songs.id).subscribe((comment: Comments[]) => {
        this.listComment = comment
      })
    })
  }

  getDuration() {
    let timeInSecond = this.waveSurfer.getDuration()
    let minutes = Math.floor(timeInSecond / 60);
    let second = Math.round(timeInSecond - minutes * 60);
    return minutes + ':' + second
  }

  canDeactivate() {
    this.waveSurfer.destroy();
    this.isPlaying = false;
    this.waveSurfer = undefined;
    return true;
  }
}
