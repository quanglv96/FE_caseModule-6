import {Component, OnInit, Input} from '@angular/core';
import {NgxWavesurferService} from "ngx-wavesurfer";
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
import {SongSyncService} from "../service/song-sync.service";
import * as moment from "moment/moment";
import * as $ from "jquery"

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css']
})
export class SongComponent implements OnInit, CanComponentDeactivate {
  loadState: string = '';
  loadingComplete = false;
  isStartPlaying = false;
  isPlaying = false;
  endTime: string = '';
  currentTime: string = '00:00';
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
  statusLike: boolean | undefined;
  statusLogin: boolean | undefined;
  countByUser: any
  countSongByUser: number | any = 0;
  countPlaylistByUser: number | any = 0;
  count = 0;

  constructor(public waveSurferService: NgxWavesurferService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private songService: SongsService,
              private userService: UserService,
              private dataService: DataService,
              private dialog: MatDialog,
              private syncService: SongSyncService) {
  }

  ngOnInit() {
    this.syncService.onPageChange.next('song-page')
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
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      this.songService.findSongById(paramMap.get('id')).subscribe((song: Songs) => {
        this.songs = song;
        this.syncService.songOfPageId = Number(this.songs.id as string)
        if (localStorage.getItem('idUser')) {
          this.statusLogin = true
          this.userService.findById(localStorage.getItem('idUser')).subscribe((users: User) => {
            this.user = users;
            this.statusLike = !!this.songs.userLikeSong?.find(id => id.id == this.user.id)?.id;
          })
        }
        this.url = song.audio;
        this.renderAudioOnStart()
        this.userService.countByUser(this.songs?.users?.id).subscribe(list => {
          this.countSongByUser = list[1];
          this.countPlaylistByUser = list[0];
        })
        this.songService.getCommentSong(this.songs.id).subscribe((comment: Comments[]) => {
          this.listComment = comment
        })
        this.songService.getHint5Songs(this.songs.id).subscribe((data: Songs[]) => {
          this.suggestSongs = data;
        })
        this.songs.views = this.songs.views as number + 1;
        this.songService.changeLikeSongOrViews(song).subscribe()
      })
    })
    this.dataService.changeMessage("clearSearch");
    localStorage.setItem('playlistId', JSON.stringify(null))
    this.subscribeEventFromPlayer()
  }

  sendComment() {
    const comment = {
      content: this.contentComment,
      users: this.user,
      songs: this.songs
    }
    this.songService.saveComment(comment).subscribe((comment: Comments[]) => {
      this.contentComment = '';
      this.listComment = comment;
    })
  }
  changeLike() {
    if (!this.statusLogin) {
      this.router.navigateByUrl('auth').finally()
    } else {
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
    if (localStorage.getItem('idUser')) {
      this.dialog.open(AddSongToPlaylistComponent, {
        width: '500px',
        data: {
          idUser: this.user.id,
          song: this.songs
        }
      });
    } else {
      this.router.navigateByUrl('auth').finally()
    }

  }
  /** Event */
  // Wave event
  addWavesurferEvent() {
    this.handlerReady()
    this.handlerTimeline();
    this.handlerFastForwardSong();
    this.handlerFinish();
  }
  handlerReady() {
    this.waveSurfer.on('ready', () => {
      this.loadingComplete = true;
      this.endTime = this.getDuration();
      this.waveSurfer.setMute(true);
      this.autoPlayWhenPlayerPlayingSameSong()
    })
  }
  handlerFastForwardSong() {
    this.waveSurfer.on('seek', () => {
      if (this.syncService.compareSong()) {
        this.syncService.onFastForwardSong.next({source: 'song-page', pos: this.waveSurfer.getCurrentTime()})
      } else {
        this.waveSurfer.play()
        this.isPlaying = this.waveSurfer.isPlaying()
        this.syncService.isSongPagePlaying = true;
      }
    })
  }
  handlerTimeline() {
    this.waveSurfer.on('audioprocess', () => {
      if (this.syncService.compareSong()) {}
      this.currentTime = this.formatTime(this.waveSurfer.getCurrentTime())
    })
  }
  handlerFinish() {
    this.waveSurfer.on('finish', () => {
      this.isPlaying = false;
    })
  }
  // Player event
  subscribeEventFromPlayer() {
    this.onPlayPause()
    this.onPlayerFastForward()
    this.onPlayerResponseCurrentTime()
    this.onPlayerNavigate()
  }
  onPlayPause() {
    this.syncService.onPlayPause.subscribe(
      data => {
        if (data === 'player-play-on-song-page-start-play' && this.waveSurfer != undefined) {
          this.waveSurfer.play()
          this.isPlaying = this.waveSurfer.isPlaying();
          this.syncService.isSongPagePlaying = true;
          return
        }
        if (data === 'player-play' && this.waveSurfer != undefined) {
          this.waveSurfer.play()
          this.isPlaying = this.waveSurfer.isPlaying();
          this.syncService.isSongPagePlaying = true;
          return
        }
        if (data === 'player-pause' && this.waveSurfer != undefined) {
          this.waveSurfer.pause()
          this.isPlaying = this.waveSurfer.isPlaying();
          this.syncService.isSongPagePlaying = false;
          return
        }
        if (data === 'navigate-on-same-song-with-page' && this.waveSurfer != undefined) {
          this.waveSurfer.play()
          this.isPlaying = this.waveSurfer.isPlaying();
          this.syncService.isSongPagePlaying = true;
          return
        }
      }
    )
  }
  onPlayerFastForward() {
    this.syncService.onFastForwardSong.subscribe(
      data => {
        if (data.source === 'player' && this.syncService.compareSong() && this.waveSurfer != undefined) {
          this.waveSurfer.setCurrentTime(data.pos)
        }
      }
    )
  }
  onPlayerResponseCurrentTime() {
    this.syncService.onResponseCurrentTime.subscribe(
      data => {
        if (data.desc === 'player-response-song-page-current-time' && this.waveSurfer != undefined) {
          this.waveSurfer.setCurrentTime(data.pos + 0.15)
          this.waveSurfer.play()
          this.isPlaying = this.waveSurfer.isPlaying()
          this.syncService.isSongPagePlaying = true;
          return
        }
        if (data.desc === 'current-time-of-player-when-page-start' && this.waveSurfer != undefined) {
          this.waveSurfer.setCurrentTime(data.pos)
          this.waveSurfer.pause()
          this.isPlaying = this.waveSurfer.isPlaying()
          this.syncService.isSongPagePlaying = false;
          this.currentTime = this.formatTime(data.pos)
          return;
        }
      }
    )
  }
  onPlayerNavigate() {
    this.syncService.onNavigateSong.subscribe(
      data => {
        let nextSong = data.data as Songs
        if (data.state === 'next-song-page-loop-one') {
          this.waveSurfer.setCurrentTime(0)
          this.waveSurfer.play()
          this.isPlaying = this.waveSurfer.isPlaying();
          this.syncService.isSongPagePlaying = true;
          return
        }
        if (nextSong?.id == this.songs?.id) {
          this.syncService.onNavigateSong.next({state: 'navigate-on-same-song-with-page', data: null})
        } else if (data.state === 'navigate-on-page-song' && nextSong.id != this.songs.id) {
          this.waveSurfer.pause()
          this.waveSurfer.setCurrentTime(0)
          this.waveSurfer.pause()
          this.currentTime = '00:00'
          this.isPlaying = false
          this.syncService.isSongPagePlaying = false;
          this.syncService.onPlayPause.next('navigate-on-page-song')
        } else if (data.state === 'next-song-page-loop-one') {

        }
      }
    )
  }
  /** Music action */
  renderAudioOnStart() {
    this.waveSurfer = this.waveSurferService.create(this.option)
    this.waveSurfer.load(this.songs.audio)
    this.addWavesurferEvent()
  }
  playPause() {
    let playlistId = JSON.parse(localStorage.getItem('playlistId') as string)
    if (this.loadingComplete) {
      if (this.syncService.compareSong() && !playlistId && this.isStartPlaying) {
        console.log('toggle play')
        this.togglePlayPause()
      } else {
        console.log('start play')
        this.startPlaying()
      }
    }
    this.isStartPlaying = true;
  }
  startPlaying() {
    if (!this.syncService.compareSong()) {
      this.syncService.onSongChange.next({song: this.songs, suggest: [this.songs, ...this.suggestSongs]})
    } else if (!this.isStartPlaying) {
      this.syncService.onResponseCurrentTime.next({desc: 'current-time-of-song-page-when-start-playing', pos: this.waveSurfer.getCurrentTime()})
      this.waveSurfer.play()
      this.isPlaying = this.waveSurfer.isPlaying()
      this.syncService.isSongPagePlaying = true
    }
  }
  togglePlayPause() {
    if (!this.waveSurfer.isPlaying()) {
      this.waveSurfer.play();
      this.syncService.isSongPagePlaying = true
      this.syncService.onPlayPause.next('song-page-play')
    } else {
      this.waveSurfer.pause();
      this.syncService.isSongPagePlaying = false
      this.syncService.onPlayPause.next('song-page-pause')
    }
    this.isPlaying = this.waveSurfer.isPlaying();
  }
  autoPlayWhenPlayerPlayingSameSong() {
    if (this.syncService.compareSong() && this.syncService.isPlayerPlaying) {
      this.syncService.onRequestCurrentTime.next('song-page-request-time')
      let playlist = [this.songs, ...this.suggestSongs]
      localStorage.setItem('playlist', JSON.stringify(playlist))
      this.isStartPlaying = true;
      return
    }
    if (this.syncService.compareSong() && !this.syncService.isPlayerPlaying) {
      this.syncService.onRequestCurrentTime.next('current-time-of-player-when-page-start')
    }
  }
  /** Util */
  getDuration() {
    return this.formatTime(this.waveSurfer.getDuration())
  }
  formatTime(time: number) {
    let format: string = "mm:ss"
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }
  canDeactivate() {
    this.waveSurfer.destroy();
    this.isPlaying = false;
    this.waveSurfer = undefined;
    this.syncService.onPageChange.next('none')
    return true;
  }
}
