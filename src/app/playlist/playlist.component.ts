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
import {AudioPlayerService} from "../service/audio-player.service";
import {Songs} from "../model/Songs";
import * as moment from "moment";

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
  playlistId?: number = +this.activatedRoute.snapshot.params['id'];
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
  countSongByUser: number = 0;
  countPlaylistByUser: number = 0;
  loadingComplete: boolean = false;
  currentTime: string = '00:00';
  loadState: string = '';
  currentSong?: Songs
  songList: Songs[] = []
  index: number = 0

  constructor(private playlistService: PlaylistService,
              public waveSurferService: NgxWavesurferService,
              private activatedRoute: ActivatedRoute,
              private userService: UserService,
              private commentService: CommentService,
              private dataService: DataService,
              private router: Router,
              private songService: SongsService,
              private audioService: AudioPlayerService) {
  }

  ngOnInit() {
    this.audioService.activePage = 'playlistDetails'
    this.subscribeEvent()
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

    this.playlistService.findPlaylistById(this.playlistId).subscribe(data => {
        this.playlist = data;
        this.songList = this.playlist.songsList as Songs[]
        // @ts-ignore
        this.playlist.views = this.playlist?.views + 1
        if (localStorage.getItem('idUser')) {
          this.statusLogin = true
          this.userService.findById(localStorage.getItem('idUser')).subscribe((users: User) => {
            this.user = users;
            this.statusLike = !!this.playlist.userLikesPlaylist?.find(id => id.id == this.user.id)?.id;
          })
        }
        this.playlistService.changeLikePlaylistOrViews(this.playlist).subscribe(() => {

        })
        this.userService.countByUser(this.playlist.users?.id).subscribe(
          data => {
            this.countSongByUser = data[1];
            this.countPlaylistByUser = data[0];
          }
        )
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
    // @ts-ignore
    let userId = +localStorage.getItem('idUser')
    this.userService.countByUser(userId).subscribe(
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
    // @ts-ignore
    this.playlist.songsList[i].views = this.playlist.songsList[i].views + 1;
    // @ts-ignore
    this.songService.changeLikeSongOrViews(this.playlist?.songsList[i]).subscribe(()=>{
    });
    $('.song.active').removeClass('active')
    // @ts-ignore
    $('.song-' + this.playlist.songsList[i].id).addClass('active')
    this.load(i)
  }

  load(i: number) {
    if (!!this.wavesurfer) {
      this.wavesurfer.destroy();
    }
    // @ts-ignore
    if(this.playlist.songsList[i]){
      // @ts-ignore
      if (this.playlist.songsList[i].views) {
        // @ts-ignore
        this.playlist.songsList[i].views = this.playlist.songsList[i].views + 1;
        // @ts-ignore
        this.songService.changeLikeSongOrViews(this.playlist?.songsList[i]).subscribe(()=>{
        });
      }
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
        $('.song.active').removeClass('active')
        // @ts-ignore
        $('.song-' + this.playlist.songsList[i + 1].id).addClass('active')
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
    return this.formatTime(this.wavesurfer.getDuration())
  }

  formatTime(time: number) {
    let format: string = "mm:ss"
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }

  canDeactivate() {
    if (this.wavesurfer !== undefined) {
      this.wavesurfer.destroy()
    }
    this.wavesurfer = undefined
    this.audioService.activePage = 'none'
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
    if (!this.statusLogin) {
      this.router.navigateByUrl('auth').finally()
    } else {
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

  renderAudioOnClick(i: number) {
    if (!!this.wavesurfer) {
      this.wavesurfer.destroy()
      this.wavesurfer = undefined
    }
    this.songList = this.playlist.songsList as Songs[]
    this.currentSong = this.songList[i]
    this.audioService.songOfPageId = Number(this.currentSong.id as string)
    this.currentTime = '00:00';
    this.audioService.loadSongOfBarComplete = false;
    this.loadingComplete = false;
    this.isPlaying = false;
    this.wavesurfer = this.waveSurferService.create(this.option)
    this.loadAudio(this.wavesurfer, this.currentSong.audio).then(() => {
      this.audioService.loadSongOfPageChange.next(true);
      this.wavesurfer.setMute(true)
      this.endTime = this.getDuration();
      this.loadingComplete = true;
      this.audioService.loadStateChange.next('page')
      if (!this.audioService.compareSong()) {
        this.audioService.songChange.next({song: this.currentSong as Songs, source: 'playlist'})
        this.songList = this.playlist.songsList as Songs[]
        this.audioService.playlistChange.next(this.songList);
      }
      if (this.audioService.compareSong()) {
        this.audioService.loadSongOfBarComplete = true;
      }
      if (this.audioService.loadSongOfBarComplete || this.loadState === 'page') {
        this.togglePlayPause()
      }
    })
    this.wavesurfer.on('finish', () => {
      this.isPlaying = false;
    })
    this.wavesurfer.on('seek', (progress: any) => {
      if (this.audioService.compareSong()) {
        this.audioService.fastForwardPos.next({source: 'page', pos: this.wavesurfer.getCurrentTime()})
      }
    })
    this.wavesurfer.on('audioprocess', () => {
      if (this.audioService.compareSong()) {}
      this.currentTime = this.formatTime(this.wavesurfer.getCurrentTime())
    })
    this.loadSongToBarSubscribe()
  }

  newPlayMethod(i: number) {
    this.audioService.songOfPageId = Number(this.songList[i].id)
    if (!this.isStartPlaying || !this.audioService.compareSong()) {
      this.renderAudioOnClick(i);
      this.isStartPlaying = true;
      // @ts-ignore
      this.playlist.songsList[i].views = this.playlist.songsList[i].views + 1;
      // @ts-ignore
      this.songService.changeLikeSongOrViews(this.playlist?.songsList[i]).subscribe(()=>{
      });
    }

    if (this.loadingComplete) {
      if (this.audioService.compareSong()) {
        this.audioService.loadSongOfBarComplete = true;
      }
      if (this.audioService.loadSongOfBarComplete || this.loadState === 'page') {
        this.togglePlayPause()
      }
    }
  }

  subscribeEvent() {
    this.subscribePlayPause();
    this.loadSongToBarSubscribe();
    this.loadStateSubscribe();
    this.nextChangeSubscribe();
    this.subscribeFastForward();
    this.subscribeCurrentTime();
  }

  subscribeFastForward() {
    this.audioService.fastForwardPos.subscribe(
      (pos) => {
        if (pos.source === 'bar') {
          this.wavesurfer.setCurrentTime(pos.pos)
        }
      }
    )
  }

  subscribeCurrentTime() {
    this.audioService.currentTimeOfBar.subscribe(
      time => {
        if (time as number > 0 && this.audioService.compareSong() && this.wavesurfer !== undefined) {
          let currentTime = time as number + 0.15
          this.wavesurfer.play(currentTime);
          this.audioService.playState.next('barPlay');
          this.isPlaying = this.wavesurfer.isPlaying()
        }
      }
    )
  }

  subscribePlayPause() {
    this.audioService.playState.subscribe(
      data => {
        if (data === 'pagePlay' && this.wavesurfer !== undefined) {
          this.wavesurfer.play();
          this.isPlaying = this.wavesurfer.isPlaying();
        } else if (data === 'pagePause' && this.wavesurfer !== undefined) {
          this.wavesurfer.pause();
          this.isPlaying = this.wavesurfer.isPlaying();
        }
      }
    )
  }
  togglePlayPause() {
    if (!this.wavesurfer.isPlaying()) {
      console.log('play')
      this.wavesurfer.play();
      this.audioService.playState.next('barPlay')
    } else {
      console.log('pause')
      this.wavesurfer.pause();
      this.audioService.playState.next('barPause')
    }
    this.isPlaying = this.wavesurfer.isPlaying();
  }
  loadSongToBarSubscribe() {
    this.audioService.loadSongOfBarChange.subscribe(
      data => {
        if (this.loadState === 'page' && this.loadingComplete && this.wavesurfer !== undefined) {
          this.wavesurfer.play()
          console.log('play')
          this.isPlaying = this.wavesurfer.isPlaying()
          this.audioService.playState.next('barPlay')
          this.audioService.loadSongOfBarComplete = true;
        }
        if (this.loadState === 'next/prev' && this.loadingComplete && this.wavesurfer !== undefined) {
          this.wavesurfer.stop()
          this.currentTime = '00:00'
          this.isPlaying = false;
        }
      }
    )
  }
  loadStateSubscribe() {
    this.audioService.loadStateChange.subscribe(
      data => {
        this.loadState = data;
      }
    )
  }
  nextChangeSubscribe() {
    this.audioService.nextChange.subscribe(
      data => {
        this.index = data
        console.log(data)
        this.newPlayMethod(this.index)
      }
    )
  }
}
