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
import {Songs} from "../model/Songs";
import * as moment from "moment";
import {PlaylistSyncService} from "../playlist-sync.service";

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

  isFirstTimeClickPlayButton = true;
  isStartLoading: boolean = false;
  isLoadingComplete: boolean = false;
  isPlaying: boolean = false;
  position: number = 0;
  currentTime: string = '00:00';
  endTime: string = '';
  loadAudioState: string = 'navigate-load';

  statusLike: boolean | undefined;
  statusLogin: boolean | undefined;
  singerSong: any;
  countSongByUser: number = 0;
  countPlaylistByUser: number = 0;
  currentSong?: Songs
  songList: Songs[] = []
  @Input() contentComment: string = "";

  constructor(private playlistService: PlaylistService,
              public waveSurferService: NgxWavesurferService,
              private activatedRoute: ActivatedRoute,
              private userService: UserService,
              private commentService: CommentService,
              private dataService: DataService,
              private router: Router,
              private songService: SongsService,
              private syncService: PlaylistSyncService) {
  }

  ngOnInit() {
    this.subscribeEventFromPlayer()
    this.syncService.onPageChange.next('playlist')
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
        this.syncService.currentPLIdOfPLPage = Number(this.playlist?.id);

        this.playlist.views = this.playlist?.views as number + 1
        /** handle loading here */
        this.autoPlayWhenPlayerIsPlayingSamePL()
        if (localStorage.getItem('idUser')) {
          this.statusLogin = true
          this.userService.findById(localStorage.getItem('idUser')).subscribe((users: User) => {
            this.user = users;
            this.statusLike = !!this.playlist.userLikesPlaylist?.find(id => id.id == this.user.id)?.id;
          })
        }
        this.playlistService.changeLikePlaylistOrViews(this.playlist).subscribe()
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
          }
        )
      }
    )
    let userId = Number(localStorage.getItem('idUser'))
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

  sendComment() {
    const comment = {
      content: this.contentComment,
      users: this.user,
      playlist: this.playlist
    }
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
  canDeactivate() {
    if (this.wavesurfer !== undefined) {
      this.wavesurfer.destroy()
    }
    this.wavesurfer = undefined
    this.isStartLoading = false;
    this.syncService.isPLPageStartLoading = false;
    this.syncService.isPLPageLoadComplete = false;
    this.syncService.isPLPagePlaying = false;
    this.syncService.currentSongIdOfPLPage = -1;
    this.syncService.currentPLIdOfPLPage = -1;
    this.syncService.onPageChange.next('none')
    this.syncService.count = 0;
    return true;
  }

  /** Event */
  // 1. Wave event
  addWavesurferEvent() {
    this.handlerReadyEvent();
    this.handlerFastForwardEvent();
    this.handlerTimeEvent();
  }
  handlerReadyEvent() {
    this.wavesurfer.on('ready', () => {
      sessionStorage.removeItem('player-time')
      this.endTime = this.getDuration()
      this.wavesurfer.setVolume(0)
      this.isLoadingComplete = true;
      this.syncService.isPLPageLoadComplete = true;
      this.isPlaying = true;
      if (this.loadAudioState === 'navigate-load') {
        this.syncService.onPLPageLoadingComplete.next(
          {state: 'navigate-song', data: [this.currentSong, this.playlist]}
        )
        return
      }
      if (this.loadAudioState === 'start-play-when-player-play') {
        this.wavesurfer.setCurrentTime(this.syncService.playerCurrentTime)
        this.wavesurfer.play()
        this.isPlaying = this.wavesurfer.isPlaying()
        this.syncService.isPLPagePlaying = true
        this.syncService.onPLPageStartPlay.next('pl-play-when-player-toggle-play')
        return;
      }
      if (this.loadAudioState === '') {
        this.wavesurfer.setCurrentTime(this.syncService.playerCurrentTime + 0.2)
        this.wavesurfer.play()
        this.isPlaying = this.wavesurfer.isPlaying()
      }
      this.loadAudioState = ''
    })
  }
  handlerFastForwardEvent() {
    this.wavesurfer.on('seek', () => {
      this.syncService.onFastForwardSong.next({source: 'pl-page', pos: this.wavesurfer.getCurrentTime()})
    })
  }
  handlerTimeEvent() {
    this.wavesurfer.on('audioprocess', () => {
      if (this.syncService.comparePlaylist()) {}
      this.currentTime = this.formatTime(this.wavesurfer.getCurrentTime())
    })
  }
  // 2. Player event
  subscribeEventFromPlayer() {
    this.onPlayPauseToggle();
    this.onNavigateToSong();
    this.onRetrievingCurrentTime();
    this.onPlayerFastForward();
  }
  onPlayPauseToggle() {
    this.syncService.onPlayPauseToggle.subscribe(
      data => {
        if (data === 'player-played-on-navigate' && this.wavesurfer != undefined) {
          if (this.isFirstTimeClickPlayButton) {
            let time = sessionStorage.getItem('player-time')
            sessionStorage.removeItem('player-time')
            this.wavesurfer.setCurrentTime(time)
            this.isFirstTimeClickPlayButton = false;
          }
          this.wavesurfer.play()
          this.isPlaying = this.wavesurfer.isPlaying()
          this.syncService.isPLPagePlaying = true
        }
        if (data === 'player-play' && this.wavesurfer != undefined) {
          this.wavesurfer.play()
          this.isPlaying = this.wavesurfer.isPlaying()
          this.syncService.isPLPagePlaying = true
        }
        if (data === 'player-pause' && this.wavesurfer != undefined) {
          this.wavesurfer.pause()
          this.isPlaying = this.wavesurfer.isPlaying()
          this.syncService.isPLPagePlaying = false
        }
      }
    )
  }
  onNavigateToSong() {
    this.syncService.onNavigateToSong.subscribe(
      data => {
        if (data.desc === 'next-song') {
          let id = data.data['id']
          this.loadAudioState = 'navigate-load'
          $('.song-' + id).trigger('click')
        }
        if (data.desc === 'play-when-pl-page-is-not-play') {
          let id = data.data[0]['id']
          this.position = data.data[1]
          this.loadAudioState = 'start-play-when-player-play'
          $('.song-' + id).trigger('click')
        }
      }
    )
  }
  onRetrievingCurrentTime() {
    this.syncService.onResponseCurrentTime.subscribe(
      data => {
        if (data.action === 'response-current-time-from-player' && this.syncService.count < 1) {
          this.syncService.count++
          let id = this.syncService.currentSongIdOfPlayer
          let selector = '.song-' + id
          setTimeout(() => {
            this.loadAudioState = 'autoplay-play-when-player-play'
            $(selector).trigger('click')
          }, 0)
        }
      }
    )
  }
  onPlayerFastForward() {
    this.syncService.onFastForwardSong.subscribe(
      data => {
        if (data.source === 'player') {
          this.wavesurfer.setCurrentTime(data.pos)
        }
      }
    )
  }
   /** Playlist page action */
  autoPlayWhenPlayerIsPlayingSamePL() {
    if (this.syncService.isPlayerPlaying && this.syncService.comparePlaylist()) {
      this.loadAudioState = ''
      let id = this.syncService.currentSongIdOfPlayer
      this.currentSong = this.songList.find(s => s.id == id.toString())
      this.isStartLoading = true;
      this.syncService.onRequestCurrentTime.next({action: 'request-current-time-of-player', pos: -1})
    }
  }
  onPLPageNavigate(i: number) {
    this.currentSong = this.songList[i]
    this.syncService.currentSongIdOfPLPage = Number(this.currentSong.id)
    if (!!this.wavesurfer) {
      this.wavesurfer.destroy()
      this.wavesurfer = undefined
    }
    this.isLoadingComplete = false;
    this.syncService.isPLPageLoadComplete = false;
    this.isPlaying = false;
    this.wavesurfer = this.waveSurferService.create(this.option)
    this.isStartLoading = true
    this.addWavesurferEvent();
    this.syncService.isPLPageStartLoading = true;
    this.wavesurfer.load(this.currentSong.audio)
    this.selected(this.getCurrentSongIndex())
  }
  playButtonAction() {
    if (!this.isStartLoading) {
      this.startPlaying()
    } else {
      this.togglePlayPause()
    }
  }
  startPlaying() {
    if (this.syncService.comparePlaylist()) {
      let id = this.syncService.currentSongIdOfPlayer
      this.currentSong = this.songList.find(s => s.id == id.toString())
      let index = this.getCurrentSongIndex()
      this.onPLPageNavigate(index)
    } else {
      this.currentSong = this.songList[0]
      this.onPLPageNavigate(0)
    }
  }
  togglePlayPause() {
    if (this.wavesurfer.isPlaying()) {
      this.wavesurfer.pause()
      this.syncService.onPlayPauseToggle.next('pl-page-pause')
    } else {
      this.wavesurfer.play()
      this.syncService.onPlayPauseToggle.next('pl-page-play')
    }
    this.isPlaying = this.wavesurfer.isPlaying()
  }
  /** Util */
  getCurrentSongIndex() {
    return this.songList.findIndex(song => song.id === this.currentSong?.id)
  }
  getIndex(song: Songs) {
    return this.songList.findIndex(s => s.id === song.id)
  }
  selected(i: number) {
    $('.song.active').removeClass('active')
    $('.song-' + this.songList[i].id).addClass('active')
  }
  formatTime(time: number) {
    let format: string = "mm:ss"
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }
  getDuration() {
    return this.formatTime(this.wavesurfer.getDuration())
  }
}
