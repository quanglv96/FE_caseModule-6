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
              // private audioService: AudioPlayerService,
              private syncService: PlaylistSyncService) {
  }

  ngOnInit() {
    this.subscribeEventFromPlayer()
    this.syncService.onPageChange.next('playlist')
    // this.audioService.activePage = 'playlistDetails'
    // this.subscribeEvent()
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
        // this.audioService.playlistOfPageId = Number(this.playlist?.id);
        this.syncService.currentPlaylistOfPlaylistPageId = Number(this.playlist?.id);
        this.playlist.views = this.playlist?.views as number + 1
        /** handle loading here */
        this.playPlaylistWhenPlayerIsAlreadyPlayingThis()
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



  @Input() contentComment: string = "";

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

  renderAudioOnClick(i: number) {
    this.songList = this.playlist.songsList as Songs[]
    this.currentSong = this.songList[i]
    console.log(this.songList)
    console.log(this.currentSong)
    // this.audioService.songOfPageId = Number(this.currentSong.id as string)
    this.currentTime = '00:00';
    // this.audioService.loadSongOfBarComplete = false;
    this.loadingComplete = false;
    this.isPlaying = false;
    this.wavesurfer = this.waveSurferService.create(this.option)
    this.isStartPlaying = true
    this.loadAudio(this.wavesurfer, this.currentSong.audio).then(() => {
      // this.audioService.loadSongOfPageChange.next(true);
      // this.wavesurfer.setMute(true)
      this.endTime = this.getDuration();
      this.loadingComplete = true;
      this.wavesurfer.play()

      console.log(this.isStartPlaying)
      // this.audioService.loadSongOfPlaylistComplete = true;
      // this.audioService.loadStateChange.next('page')
      // if (!this.audioService.compareSong()) {
      //   this.audioService.songChange.next({song: this.currentSong as Songs, source: 'playlist'})
      //   this.songList = this.playlist.songsList as Songs[]
      // }
      // this.audioService.playlistChange.next({id: Number(this.playlist?.id), playlist: this.songList});
      // if (this.audioService.compareSong()) {
      //   this.audioService.loadSongOfBarComplete = true;
      // }
      // if (this.audioService.loadSongOfBarComplete || this.loadState === 'page') {
      //   this.togglePlayPause()
      // }
    })
    this.wavesurfer.on('finish', () => {
      this.isPlaying = false;
    })
    this.wavesurfer.on('seek', () => {
      // if (this.audioService.compareSong()) {
      //   this.audioService.fastForwardPos.next({source: 'page', pos: this.wavesurfer.getCurrentTime()})
      // }
    })
    this.wavesurfer.on('audioprocess', () => {
      // if (this.audioService.compareSong()) {}
      this.currentTime = this.formatTime(this.wavesurfer.getCurrentTime())
    })
  }

  // newPlayMethod(i: number) {
  //   this.audioService.songOfPageId = Number(this.songList[i].id)
  //   if (!this.isStartPlaying || !this.audioService.comparePlayList()
  //     || this.audioService.action == 'next' ) {
  //     this.renderAudioOnClick(i);
  //     this.selected(i)
  //     this.isStartPlaying = true;
  //   }
  //   if (this.loadingComplete) {
  //     if (this.audioService.comparePlayList()) {
  //       this.audioService.loadSongOfBarComplete = true;
  //     }
  //     if (this.audioService.loadSongOfBarComplete || this.loadState === 'page') {
  //       this.togglePlayPause()
  //     }
  //   }
  // }

  // playOnClick(i: number) {
  //   if (this.songList[i].id !== this.currentSong?.id) {
  //     this.loadAndPlay(i);
  //   }
  // }

  // loadAndPlay(i: number) {
  //   this.audioService.songOfPageId = Number(this.songList[i].id)
  //   this.renderAudioOnClick(i);
  //   this.selected(i)
  //   this.isStartPlaying = true;
  //   if (this.loadingComplete) {
  //     if (this.audioService.comparePlayList()) {
  //       this.audioService.loadSongOfBarComplete = true;
  //     }
  //     if (this.audioService.loadSongOfBarComplete || this.loadState === 'page') {
  //       this.togglePlayPause()
  //     }
  //   }
  // }

  // subscribeEvent() {
  //   this.subscribePlayPause();
  //   this.loadSongToBarSubscribe();
  //   this.loadStateSubscribe();
  //   this.nextChangeSubscribe();
  //   this.subscribeFastForward();
  //   this.subscribeCurrentTime();
  // }

  // subscribeFastForward() {
  //   this.audioService.fastForwardPos.subscribe(
  //     (pos) => {
  //       if (pos.source === 'bar') {
  //         this.wavesurfer.setCurrentTime(pos.pos)
  //       }
  //     }
  //   )
  // }
  //
  // subscribeCurrentTime() {
  //   this.audioService.currentTimeOfBar.subscribe(
  //     time => {
  //       if (time as number > 0 && this.audioService.compareSong() && this.wavesurfer !== undefined) {
  //         let currentTime = time as number + 0.15
  //         this.wavesurfer.play(currentTime);
  //         this.audioService.playState.next('barPlay');
  //         this.isPlaying = this.wavesurfer.isPlaying()
  //       }
  //     }
  //   )
  // }
  //
  // subscribePlayPause() {
  //   this.audioService.playState.subscribe(
  //     data => {
  //       if (data === 'pagePlay' && this.wavesurfer !== undefined) {
  //         this.wavesurfer.play();
  //         this.isPlaying = this.wavesurfer.isPlaying();
  //       } else if (data === 'pagePause' && this.wavesurfer !== undefined) {
  //         this.wavesurfer.pause();
  //         this.isPlaying = this.wavesurfer.isPlaying();
  //       }
  //     }
  //   )
  // }
  //
  // togglePlayPause() {
  //   if (!this.wavesurfer.isPlaying()) {
  //     console.log('play')
  //     this.wavesurfer.play();
  //     this.audioService.playState.next('barPlay')
  //   } else {
  //     console.log('pause')
  //     this.wavesurfer.pause();
  //     this.audioService.playState.next('barPause')
  //   }
  //   this.isPlaying = this.wavesurfer.isPlaying();
  // }
  //
  // loadSongToBarSubscribe() {
  //   this.audioService.loadSongOfBarChange.subscribe(
  //     () => {
  //       if (this.loadState === 'page' && this.loadingComplete && this.wavesurfer !== undefined) {
  //         this.wavesurfer.play()
  //         this.isPlaying = this.wavesurfer.isPlaying()
  //         this.audioService.playState.next('barPlay')
  //         this.audioService.loadSongOfBarComplete = true;
  //       }
  //       if (this.loadState === 'next/prev' && this.loadingComplete && this.wavesurfer !== undefined) {
  //         this.wavesurfer.stop()
  //         this.currentTime = '00:00'
  //         this.isPlaying = false;
  //       }
  //     }
  //   )
  // }
  //
  // loadStateSubscribe() {
  //   this.audioService.loadStateChange.subscribe(
  //     data => {
  //       this.loadState = data;
  //     }
  //   )
  // }
  //
  // nextChangeSubscribe() {
  //   this.audioService.nextChange.subscribe(
  //     data => {
  //       this.index = data.id
  //       if (data.state === 'next') {
  //         this.newPlayMethod(this.index)
  //       } else if (data.state === 'pageIsNotLoad') {
  //         this.playOnClick(this.index)
  //       }
  //     }
  //   )
  // }

  // test() {
  //   let parent = document.getElementById("waveform") as HTMLElement
  //   let child = parent.children
  //   if (child.length >= 5) {
  //     for (let i = 3; i < child.length - 2; i++) {
  //       // @ts-ignore
  //       child[i]['style'].display = 'none'
  //     }
  //     console.log(child)
  //   }
  // }

  addWavesurferEvent() {
    this.wavesurfer.on('finish', () => {
      this.isPlaying = false;
    })
    this.wavesurfer.on('seek', () => {
      if (this.syncService.compareSong()) {
        this.syncService.onFastForwardSong.next({source: 'playlist-page', pos: this.wavesurfer.getCurrentTime()})
      }
    })
    this.wavesurfer.on('audioprocess', () => {
      // if (this.audioService.compareSong()) {}
      this.currentTime = this.formatTime(this.wavesurfer.getCurrentTime())
    })
  }
  /** Event from audio player */
  subscribeEventFromPlayer() {
    this.onPLayerLoaded();
    this.onPlayerFastForward();
    this.onPlaylistRetrievingCurrentTime();
    this.onRetrieveCurrentSong();
    this.onPlayerTogglePlayPause()
  }
  onPLayerLoaded() {
    this.syncService.onPlayerLoaded.subscribe(
      state => {
        if (state === 'playlist-first-play' && this.wavesurfer !== undefined) {
          this.wavesurfer.play()
          this.isPlaying = this.wavesurfer.isPlaying();
          let index = this.findCurrentSongIndex()
          this.selected(index);
        }
        if (state === 'playlist-page-next') {
          this.currentSong = JSON.parse(localStorage.getItem('currentSong') as string)
          // if (this.wavesurfer !== undefined) {
          //   this.wavesurfer.destroy()
          //   this.wavesurfer = undefined
          // }
          this.destroyAndReCreateContainer();
          this.loadSongWhenNextPrevMove(this.getIndex())
        }
      }
    )
  }
  onPlayerFastForward() {
    this.syncService.onFastForwardSong.subscribe(
      data => {
        if (data.source === 'player' && this.syncService.compareSong() && this.loadingComplete) {
          this.wavesurfer.setCurrentTime(data.pos)
        }
      }
    )
  }
  onPlaylistRetrievingCurrentTime() {
    this.syncService.onRetrievingCurrentTime.subscribe(
      data => {
        if (data.action === 'player-respond-current-time' && data.pos !== -1 && this.wavesurfer !== undefined) {
          this.wavesurfer.setCurrentTime(data.pos)
          if (!this.wavesurfer.isPlaying()) {
            this.wavesurfer.play()
            this.isPlaying = this.wavesurfer.isPlaying();
          }
        }
      }
    )
  }
  onRetrieveCurrentSong() {
    this.syncService.onRetrieveCurrentSongOfPlayer.subscribe(
      song => {
        if (song.desc === 'retrieve-when-first-play') {
          this.currentSong = song.song
          this.loadSongAndPlayWhenPlayerPlay()
        }
      }
    )
  }
  onPlayerTogglePlayPause() {
    this.syncService.onTogglePlayPause.subscribe(
      data => {
        if (data === 'player-play' && this.wavesurfer !== undefined) {
          this.wavesurfer.play()
          this.isPlaying = this.wavesurfer.isPlaying();
        }
        if (data === 'player-pause' && this.wavesurfer !== undefined) {
          this.wavesurfer.pause()
          this.isPlaying = this.wavesurfer.isPlaying();
        }
      }
    )
  }
  /** Controls action */

  playPlaylist() {
    this.startPlayingPlayList()
    this.togglePlayPause()
  }
  startPlayingPlayList() {
    if (!this.isStartPlaying) {
      this.songList = this.playlist.songsList as Songs[]
      let id = this.syncService.currentSongOfPlayerId
      let songOfPlayer = this.findCurrentSongById(id.toString())
      this.currentSong = (!this.syncService.comparePlaylist()) ? this.songList[0] : songOfPlayer;
      this.syncService.currentSongOfPlayerId = Number(this.currentSong?.id)
      this.wavesurfer = this.waveSurferService.create(this.option)
      this.isStartPlaying = true;
      this.loadAudio(this.wavesurfer, this.currentSong?.audio).then(() => {
        this.loadingComplete = true;
        this.syncService.onSongChange.next({state: 'first-play', song: this.currentSong as Songs})
        this.syncService.onPlaylistChange.next({id: Number(this.playlist?.id), songList: this.songList})
        this.syncService.isPlayListPageStartPlaying = true;
        this.syncService.currentSongOfPlaylistPageId = Number(this.currentSong?.id)
        this.wavesurfer.setMute(true)
        this.endTime = this.getDuration();
        this.addWavesurferEvent()
      })
    }
  }
  togglePlayPause() {
    if (this.loadingComplete) {
      if (this.wavesurfer.isPlaying()) {
        this.wavesurfer.pause()
        this.syncService.onTogglePlayPause.next('playlist-page-pause')
      } else {
        this.wavesurfer.play()
        this.syncService.onTogglePlayPause.next('playlist-page-play')
      }
      this.isPlaying = this.wavesurfer.isPlaying()
    }
  }
  playPlaylistWhenPlayerIsAlreadyPlayingThis() {
    if (this.syncService.comparePlaylist() && this.syncService.isPlayerPlaying) {
      this.currentSong = this.findCurrentSongById(this.syncService.currentSongOfPlayerId.toString())
      this.loadSongWhenPlayerIsAlreadyPlayingThis(this.currentSong?.audio as string)
    }
  }
  loadSongWhenPlayerIsAlreadyPlayingThis(url: string) {
    this.wavesurfer = this.waveSurferService.create(this.option)
    this.isStartPlaying = true;
    this.loadAudio(this.wavesurfer, url).then(() => {
      this.loadSongWithPlayerData()
      this.syncService.onRetrievingCurrentTime.next({action: 'playlist-request-current-time', pos: -1})
    })
  }
  loadSongAndPlayWhenPlayerPlay() {
    this.wavesurfer = this.waveSurferService.create(this.option)
    this.isStartPlaying = true;
    this.loadAudio(this.wavesurfer, this.currentSong?.audio).then(() => {
      this.loadSongWithPlayerData();
      this.syncService.onTogglePlayPause.next('play-when-player-play')
      this.wavesurfer.play()
      this.isPlaying = this.wavesurfer.isPlaying()
    })
  }
  loadSongWithPlayerData() {
    this.loadingComplete = true;
    this.syncService.isPlayListPageStartPlaying = true;
    this.syncService.currentSongOfPlaylistPageId = Number(this.currentSong?.id)
    this.wavesurfer.setMute(true)
    this.endTime = this.getDuration();
    this.addWavesurferEvent()
  }
  loadSongWhenNextPrevMove(index: number) {
    this.wavesurfer = this.waveSurferService.create(this.option)
    this.isStartPlaying = true;
    this.loadAudio(this.wavesurfer, this.songList[index]).then(() => {
      this.loadSongWithPlayerData();
      this.syncService.onTogglePlayPause.next('player-next-song')
      this.wavesurfer.play()
      this.isPlaying = this.wavesurfer.isPlaying()
    })
  }

  findCurrentSongById(id: string) {
    return this.songList.find((song) => song.id == id)
  }
  findCurrentSongIndex() {
    return this.songList.findIndex((song) => song.id == this.currentSong?.id)
  }
  selected(i: number) {
    $('.song.active').removeClass('active')
    $('.song-' + this.songList[i].id).addClass('active')
  }
  loadAudio(wavesurfer: any, url: string | any) {
    return new Promise((resolve, reject) => {
      wavesurfer.load(url);
      wavesurfer.on('error', reject);
      wavesurfer.on('ready', resolve);
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
    // this.audioService.activePage = 'none'
    this.isStartPlaying = false;
    this.syncService.isPlayListPageStartPlaying = false;
    this.syncService.onPageChange.next('none')
    return true;
  }
  getIndex() {
    return this.songList.findIndex((track) => track.id === this.currentSong?.id)
  }

  destroyAndReCreateContainer() {
    $('#waveform').empty()
    console.log('abc')
  }

  test() {

  }
}
