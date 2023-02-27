import {AfterViewInit, Component, OnInit} from '@angular/core';
import {SongsService} from "../../service/songs/songs.service";
import {Songs} from "../../model/Songs";
import {DataService} from "../../service/data/data.service";
import {Router} from "@angular/router";
import SwAl from "sweetalert2";
import {AddSongToPlaylistComponent} from "../../add-song-to-playlist/add-song-to-playlist.component";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../service/user/user.service";
import {User} from "../../model/User";
import {NgxWavesurferService} from "ngx-wavesurfer";

@Component({
  selector: 'app-song-item',
  templateUrl: './song-item.component.html',
  styleUrls: ['./song-item.component.css']
})
export class SongItemComponent implements OnInit {
  idUser: any = null;
  listSongs: Songs[] = [];
  user: User={};

  option = {
    container: '',
    waveColor: '#989898',
    progressColor: '#fc821d',
    barWidth: 2,
    height: 80,
    hideScrollbar: true,
    hideCursor: true,
    cursorColor: 'transparent',
  }
  wavesurfer: any = {};
  playable: boolean = false
  isPlaying: any = {}

  constructor(private songService: SongsService,
              private dataService: DataService,
              private router: Router,
              private dialog: MatDialog,
              private userService: UserService,
              private wavesurferService: NgxWavesurferService) {
  }

  ngOnInit(): void {
    this.dataService.currentMessage.subscribe(() => {
      this.idUser = localStorage.getItem('idUser')

      if (this.idUser) {
        this.songService.findSongByUser(this.idUser).subscribe((data: Songs[]) => {
          this.listSongs = data;
        })
        this.userService.findById(this.idUser).subscribe((data:User)=>{
          this.user = data;
        })
      }
    })
  }

  statusLike: boolean | undefined;


  editSong(id: any) {
    return this.router.navigateByUrl("/library/song/edit/" + id)
  }


  // @ts-ignore
  openModalAddSongToPlaylist(song: Songs) {
    if (!localStorage.getItem('idUser')) {
      return this.router.navigateByUrl('auth')
    }
    this.dialog.open(AddSongToPlaylistComponent, {
      width: '500px',
      data: {
        idUser: localStorage.getItem('idUser'),
        song: song
      }
    });
  }

  confirmDelete(id: number | any, name: string | any) {
    // @ts-ignore
    return SwAl.fire({
      title: `Are you sure delete song: "${name}"?`,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF4500FF",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel please!",
      closeOnConfirm: false,
      closeOnCancel: false
    }).then(result => {
      if (result.isConfirmed) {
        this.deleteSong(id)
      } else if (result.isDenied) {
        SwAl.fire('Changes are not saved', '', 'info').then()
      }
    });
  }

  deleteSong(id: any) {
    SwAl.fire({
      title: `Delete Success`,
      icon: "success",
      showCancelButton: false,
      showCloseButton: false,
      timer: 2000
    }).then();
    this.songService.deleteSong(id).subscribe(() => {
      this.dataService.changeMessage("delete");
      return this.router.navigateByUrl('/library/song');
    })
  }

  changeLike(s: Songs) {

  }
}
