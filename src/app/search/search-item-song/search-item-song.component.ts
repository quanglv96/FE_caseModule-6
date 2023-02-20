import {Component, Input, OnInit} from '@angular/core';
import {faPlayCircle} from "@fortawesome/free-solid-svg-icons";
import {Songs} from "../../model/Songs";
import {Tags} from "../../model/Tags";
import {Router} from "@angular/router";
import {AddSongToPlaylistComponent} from "../../add-song-to-playlist/add-song-to-playlist.component";
import {MatDialog} from "@angular/material/dialog";
import {NgxWavesurferService} from "ngx-wavesurfer";

@Component({
  selector: 'app-search-item-song',
  templateUrl: './search-item-song.component.html',
  styleUrls: ['./search-item-song.component.css']
})
export class SearchItemSongComponent implements OnInit {
  faPlay = faPlayCircle
  @Input('song') song: Songs | any;
  tagString: string | any;
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
  wavesurfer: any;

  ngOnInit(): void {
    this.tagString = this.toStringTag(this.song.tagsList);
    this.option.container = '.wave-song-' + this.song.id
  }

  toStringTag(listTag: Tags[]) {
    let content = '';
    for (let i = 0; i < listTag.length; i++) {
      content += '#' + listTag[i].name + ' ';
    }
    return content;
  }

  constructor(private router: Router,
              private dialog: MatDialog,
              private wavesurferService: NgxWavesurferService) {

  }

  playSong(id: any) {
    if (this.wavesurfer === undefined) {
      this.wavesurfer = this.wavesurferService.create(this.option);
      this.loadAudio(this.wavesurfer, this.song.audio).then(
        () => {
          this.wavesurfer.playPause()
        }
      )
    } else {
      this.wavesurfer.playPause()
    }
  }

  loadAudio(wavesurfer: any, url: string | undefined) {
    return new Promise((resolve, reject) => {
      wavesurfer.on('error', reject);
      wavesurfer.on('ready', resolve);
      wavesurfer.load(url);
    });
  }

  redirectSongDetail(id: any) {
    return this.router.navigateByUrl('song/' + id)
  }
  // @ts-ignore
  openModalAddSongToPlaylist(song:Songs) {
    if(!localStorage.getItem('idUser')){
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
}
