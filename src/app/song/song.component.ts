import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {NgxWavesurferService} from "ngx-wavesurfer";
import * as $ from "jquery";
import {ActivatedRoute, ParamMap} from "@angular/router";
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
  songs: Songs = {};
  listComment: Comments[] = []
  stringTag: string = "";
  user: User = {}
  @Input() contentComment: string = "";
  suggestSongs: Songs[] = []
  statusLike: boolean=false;

  constructor(public waveSurferService: NgxWavesurferService,
              private activeRouter: ActivatedRoute,
              private songService: SongsService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.activeRouter.paramMap.subscribe((paramMap: ParamMap) => {
      this.songService.findSongById(paramMap.get('id')).subscribe((song: Songs) => {
        this.songs = song;
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
            this.user = user;
            if(this.songs.userLikeSong?.find(id => id.id == this.user.id)){
              this.statusLike=true;
            }
            console.log(this.statusLike)
            // @ts-ignore
            this.songService.getSuggest5Songs().subscribe((data: Songs[]) => {
              this.suggestSongs = data;
            })
          })
        })
      })
    })
  }

  ngAfterViewInit() {
    this.waveSurfer = this.waveSurferService.create(this.option)
    this.waveSurfer.load(this.songs.audio)
    this.waveSurfer.on('finish', () => {
      this.isPlaying = false;
      $('.fit-image').trigger('click')
    })
  }

  playPause() {
    this.waveSurfer.playPause();
    this.isPlaying = this.waveSurfer.isPlaying()
  }

  sendComment() {
    const comment: Comments = {
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
}
