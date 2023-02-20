import {Component, OnInit, Input} from '@angular/core';
import {NgxWavesurferService} from "ngx-wavesurfer";
import * as $ from "jquery";
import {CanComponentDeactivate} from "../service/can-deactivate";
import {ActivatedRoute, Router, ParamMap} from "@angular/router";
import {SongsService} from "../service/songs/songs.service";
import {Songs} from "../model/Songs";

import {Comments} from "../model/Comments";
import {UserService} from "../service/user/user.service";
import {User} from "../model/User";
import {DataService} from "../service/data/data.service";
import {MatDialog} from "@angular/material/dialog";
import {AddSongToPlaylistComponent} from "../add-song-to-playlist/add-song-to-playlist.component";

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
  url: string | undefined;
  option = {
    container: '#waveform',
    waveColor: 'white',
    progressColor: '#fc821d',
    barWidth: 2,
    height: 200,
    hideScrollbar: true,
    hideCursor: true,
    cursorColor: 'transparent',
  }
  songs: Songs = {};
  listComment: Comments[] = []
  user: User = {}
  @Input() contentComment: string = "";
  suggestSongs: Songs[] = []
  statusLike: boolean|undefined;
  statusLogin: boolean|undefined;
  countByUser: any
  countSongByUser:number|any=0;
  countPlaylistByUser: number|any=0;

  constructor(public waveSurferService: NgxWavesurferService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private songService: SongsService,
              private userService: UserService,
              private dataService: DataService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.dataService.currentMessage.subscribe(message => {
      switch (message){
        case "log out":
          this.statusLogin=false;
          this.statusLike=false;
          break;
        case "Login successfully":
          this.statusLogin=true;
          break;
      }
    })
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      this.songService.findSongById(paramMap.get('id')).subscribe((song: Songs) => {
        this.songs = song;
        // @ts-ignore
        this.songs.views=this.songs.views +1;
        if (localStorage.getItem('idUser')) {
          this.statusLogin = true
          this.userService.findById(localStorage.getItem('idUser')).subscribe((users: User) => {
            this.user = users;
            this.statusLike=false;
            if (this.songs.userLikeSong?.find(id => id.id == this.user.id)?.id) {
              this.statusLike = true;
            }
          })
        }
        this.url = song.audio;
        this.renderAudioOnStart()
        this.userService.countByUser(this.songs?.users?.id).subscribe(list=>{
          this.countSongByUser=list[1];
          this.countPlaylistByUser=list[0];
        })
        this.songService.getCommentSong(this.songs.id).subscribe((comment: Comments[]) => {
          this.listComment = comment
        })
        this.songService.getHint5Songs(this.songs.id).subscribe((data: Songs[]) => {
          this.suggestSongs = data;
        })
        // tăng view
        this.songService.changeLikeSongOrViews(song).subscribe(()=>{})
      })
    })
    this.dataService.changeMessage("clearSearch");
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
      $('.random-item-' + 0).trigger('click')
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
    // @ts-ignore
    this.songService.saveComment(comment).subscribe((comment: Comments[]) => {
      this.contentComment = '';
        this.listComment = comment;
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

  changeLike() {
    if(!this.statusLogin) {
      this.router.navigateByUrl('auth').finally()
    }else {
      if (!this.statusLike) {
        this.songs.userLikeSong?.push(this.user)
      } else {
        this.songs.userLikeSong = this.songs.userLikeSong?.filter(element => element.id != this.user.id)
      }
      this.statusLike = !this.statusLike
      this.songService.changeLikeSongOrViews(this.songs).subscribe(() => {
      })
    }
  }

  openModalAddSongToPlaylist() {
    if(localStorage.getItem('idUser')){
      this.dialog.open(AddSongToPlaylistComponent, {
        width: '500px',
        data: {
          idUser: this.user.id,
          song: this.songs
        }
      });
    }else {
      this.router.navigateByUrl('auth').finally()
    }

  }
}
