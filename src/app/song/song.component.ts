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
import {AudioPlayerService} from "../service/audio-player.service";
import * as moment from "moment/moment";

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css']
})
export class SongComponent implements OnInit, CanComponentDeactivate {
  loadState: string = '';
  loadingComplete = false;
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
  countSongByUser:number | any = 0;
  countPlaylistByUser: number | any = 0;

  constructor(public waveSurferService: NgxWavesurferService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private songService: SongsService,
              private userService: UserService,
              private dataService: DataService,
              private dialog: MatDialog,
              private audioService: AudioPlayerService) {
  }

  ngOnInit() {
    this.dataService.currentMessage.subscribe(message => {
      switch (message){
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
        this.audioService.songOfPageId = Number(this.songs.id as string)
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
    this.actionSubscribe();
  }

  actionSubscribe() {
    this.subscribePlayPause();
    this.subscribeFastForward();
    this.subscribeCurrentTime();
    this.loadStateSubscribe();
  }

  subscribePlayPause() {
    this.audioService.playState.subscribe(
      data => {
        if (data === 'pagePlay' && this.waveSurfer !== undefined) {
          this.waveSurfer.play();
          this.isPlaying = this.waveSurfer.isPlaying();
        } else if (data === 'pagePause' && this.waveSurfer !== undefined) {
          this.waveSurfer.pause();
          this.isPlaying = this.waveSurfer.isPlaying();
        }
      }
    )
  }

  subscribeFastForward() {
    this.audioService.fastForwardPos.subscribe(
      (pos) => {
        if (pos.source === 'bar') {
          this.waveSurfer.setCurrentTime(pos.pos)
        }
      }
    )
  }

  subscribeCurrentTime() {
    this.audioService.currentTimeOfBar.subscribe(
      time => {
        if (time as number > 0 && this.audioService.compareSong() && this.waveSurfer !== undefined) {
          let currentTime = time as number + 0.15
          this.waveSurfer.play(currentTime);
          this.audioService.playState.next('barPlay');
          this.isPlaying = this.waveSurfer.isPlaying()
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

  renderAudioOnStart() {
    this.currentTime = '00:00';
    this.audioService.loadSongOfBarComplete = false;
    this.loadingComplete = false;
    this.isPlaying = false;
    this.waveSurfer = this.waveSurferService.create(this.option)
    this.loadAudio(this.waveSurfer, this.url).then(() => {
      this.audioService.loadSongOfPageChange.next(true);
      this.waveSurfer.setMute(true)
      this.endTime = this.getDuration();
      this.loadingComplete = true;
    })
    this.waveSurfer.on('finish', () => {
      this.isPlaying = false;
    })
    this.waveSurfer.on('seek', (progress: any) => {
      if (this.audioService.compareSong()) {
        this.audioService.fastForwardPos.next({source: 'page', pos: this.waveSurfer.getCurrentTime()})
      }
    })
    this.waveSurfer.on('audioprocess', () => {
      if (this.audioService.compareSong()) {}
      this.currentTime = this.formatTime(this.waveSurfer.getCurrentTime())
    })
    this.audioService.loadSongOfBarChange.subscribe(
      data => {
        if (this.loadState === 'playDetails' && this.loadingComplete && this.waveSurfer !== undefined) {
          this.waveSurfer.play()
          this.isPlaying = this.waveSurfer.isPlaying()
          this.audioService.playState.next('barPlay')
          this.audioService.loadSongOfBarComplete = true;
        }
        if (this.loadState === 'next/prev' && this.loadingComplete && this.waveSurfer !== undefined) {
          console.log('next')
          this.waveSurfer.stop()
          this.currentTime = '00:00'
          this.isPlaying = false;
        }
      }
    )
  }

  loadAudio(wavesurfer: any, url: string | undefined) {
    return new Promise((resolve, reject) => {
      wavesurfer.on('error', reject);
      wavesurfer.on('ready', resolve);
      wavesurfer.load(url);
    });
  }

  playPause() {
    this.audioService.loadStateChange.next('playDetails')
    if (this.loadingComplete && !this.audioService.compareSong()) {
      this.audioService.songChange.next({song: this.songs, source: 'songDetails'})
      this.audioService.playlistChange.next(this.suggestSongs)
    }
    if (this.audioService.compareSong()) {
      this.audioService.loadSongOfBarComplete = true;
    }
    if (this.audioService.loadSongOfBarComplete || this.loadState === 'playDetails') {
      this.togglePlayPause()
    }
  }

  togglePlayPause() {
    if (!this.waveSurfer.isPlaying()) {
      this.waveSurfer.play();
      this.audioService.playState.next('barPlay')
    } else {
      this.waveSurfer.pause();
      this.audioService.playState.next('barPause')
    }
    this.isPlaying = this.waveSurfer.isPlaying();
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
    return true;
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
    if (localStorage.getItem('idUser')){
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
}
