import {AfterViewInit, Component, EventEmitter, OnInit, Input} from '@angular/core';
import {NgxWavesurferService} from "ngx-wavesurfer";
import * as $ from "jquery";
import {CanComponentDeactivate} from "../service/can-deactivate";
import {ActivatedRoute, Params, Router, ParamMap} from "@angular/router";
import {SongsService} from "../service/songs/songs.service";
import {Songs} from "../model/Songs";
import {data} from "jquery";
import {Comments} from "../model/Comments";
import {UserService} from "../service/user/user.service";
import {User} from "../model/User";

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css']
})
export class SongComponent implements OnInit, CanComponentDeactivate {
  autoplay = false;
  isPlaying = false;
  endTime: string = '';
  waveSurfer: any;
  url?: string;
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
        this.url = song.audio;
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
    this.loadAudio(this.waveSurfer, this.url).then(() => {
      this.endTime = this.getDuration();
      if (this.autoplay) {
        this.waveSurfer.playPause();
        this.isPlaying = this.waveSurfer.isPlaying()
      }
    })
    this.waveSurfer.on('finish', () => {
      this.isPlaying = false;
      let number = Math.floor(Math.random() * 5)
      $('.random-item-' + number).trigger('click')
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
    this.autoplay = true;
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
