import {Component, Input, OnInit} from '@angular/core';
import {Playlist} from "../model/Playlist";
import {PlaylistService} from "../service/playlist/playlist.service";
import {NgxWavesurferService} from "ngx-wavesurfer";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {User} from "../model/User";
import {UserService} from "../service/user/user.service";
import * as $ from 'jquery'
import {CanComponentDeactivate} from "../service/can-deactivate";
import {CommentService} from "../service/comment/comment.service";
import {Comments} from "../model/Comments";
import {DataService} from "../service/data/data.service";
import {SongsService} from "../service/songs/songs.service";

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit, CanComponentDeactivate {
  comments: Comments[] = []
  userData: any = [];
  songPlay?: string = '';
  songUser?: string = '';
  playlist: Playlist = {};
  playlistId?: number
  userId?: number
  user: User | any;
  wavesurfer: any
  option = {
    container: '#waveform',
    waveColor: 'white',
    progressColor: '#fc821d',
    barWidth: 2,
    height: 180,
    hideScrollbar: true,
    hideCursor: true,
    cursorColor: 'transparent'
  }
  isStartPlaying = false;
  isPlaying = false;
  endTime: string = '';
  statusLike: boolean | undefined;
  statusLogin: boolean | undefined;
  singerSong: any;

  constructor(private playlistService: PlaylistService,
              public waveSurferService: NgxWavesurferService,
              private activatedRoute: ActivatedRoute,
              private userService: UserService,
              private commentService: CommentService,
              private dataService: DataService,
              private router:Router,
              private songService:SongsService) {
  }

  ngOnInit() {
    this.dataService.currentMessage.subscribe(message => {
      switch (message) {
        case "log out":
          this.statusLogin = false;
          this.statusLike = false;
          break;
        case "Login successfully":
          this.statusLogin = true;
          break;
      }
    })
    this.playlistId = +this.activatedRoute.snapshot.params['id']

    this.playlistService.findPlaylistById(this.playlistId).subscribe(data => {
        this.playlist = data;
        // @ts-ignore
        this.playlist.views = this.playlist?.views + 1
        if (localStorage.getItem('idUser')) {
          this.statusLogin = true
          this.userService.findById(localStorage.getItem('idUser')).subscribe((users: User) => {
            this.user = users;
            this.statusLike = !!this.playlist.userLikesPlaylist?.find(id => id.id == this.user.id)?.id;
          })
        }
      this.playlistService.changeLikePlaylistOrViews(this.playlist).subscribe(()=>{

      })
      }
    )
    this.activatedRoute.params.subscribe(
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
    this.userService.countByUser(this.userId).subscribe(
      data => {
        this.userData = data;
      }
    )
    this.commentService.getPlaylistComments(this.playlistId).subscribe(
      (data: Comments[]) => {
        this.comments = data;
      }
    )
    this.dataService.changeMessage("clearSearch");
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
    this.loadAudio(this.wavesurfer, this.playlist?.songsList[i]?.audio).then(
      () => {
        // @ts-ignore
        this.songPlay = this.playlist?.songsList[i].name;
        // @ts-ignore
        this.singerSong = this.playlist?.songsList[i].singerList;
        // @ts-ignore
        this.songUser = this.playlist?.songsList[i].users.name
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
      } else {
        this.isPlaying = false;
        $('.p-avt').trigger('click')
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


  @Input() contentComment: string = "";

  sendComment() {
    const comment = {
      content: this.contentComment,
      users: this.user,
      playlist: this.playlist
    }
    // @ts-ignore
    this.songService.saveComment(comment).subscribe((comment: Comments[]) => {
      this.contentComment = '';
      this.comments = comment;
    })
  }

  changeLike() {
    if(!this.statusLogin){
      this.router.navigateByUrl('auth').finally()
    }else {
      if (!this.statusLike) {
        this.playlist?.userLikesPlaylist?.push(this.user)
      } else {
        this.playlist.userLikesPlaylist = this.playlist?.userLikesPlaylist?.filter(element => element.id != this.user.id)
      }
      this.statusLike = !this.statusLike
      this.playlistService.changeLikePlaylistOrViews(this.playlist).subscribe(() => {
      })
    }
  }
}
