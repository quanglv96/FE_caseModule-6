import {Component, Input, OnInit} from '@angular/core';
import {faPlayCircle} from "@fortawesome/free-solid-svg-icons";
import {Songs} from "../../model/Songs";
import {Tags} from "../../model/Tags";
import {Router} from "@angular/router";
import {AddSongToPlaylistComponent} from "../../add-song-to-playlist/add-song-to-playlist.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-search-item-song',
  templateUrl: './search-item-song.component.html',
  styleUrls: ['./search-item-song.component.css']
})
export class SearchItemSongComponent implements OnInit {
  faPlay = faPlayCircle
  @Input('song') song: Songs | any;
  tagString: string | any;

  ngOnInit(): void {
    this.tagString = this.toStringTag(this.song.tagsList);
  }

  toStringTag(listTag: Tags[]) {
    let content = '';
    for (let i = 0; i < listTag.length; i++) {
      content += '#' + listTag[i].name + ' ';
    }
    return content;
  }

  constructor(private router: Router,private dialog: MatDialog) {

  }

  playSong(id: any) {
    console.log(id)
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
