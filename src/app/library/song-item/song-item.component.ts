import {Component, OnInit} from '@angular/core';
import {SongsService} from "../../service/songs/songs.service";
import {Songs} from "../../model/Songs";

@Component({
  selector: 'app-song-item',
  templateUrl: './song-item.component.html',
  styleUrls: ['./song-item.component.css']
})
export class SongItemComponent implements OnInit {
  idUser: any;
  listSongs: Songs[] = [];

  constructor(private songService: SongsService) {
  }

  ngOnInit(): void {
    localStorage.setItem('idUser', '1')
    this.idUser = localStorage.getItem('idUser')
    // @ts-ignore
    this.songService.findSongByUser(this.idUser).subscribe((data: Songs[]) => {
      this.listSongs = data;
    })
  }

  likeSong(id:any) {

  }

  editSong(id: any) {

  }

  addPlayList(id: any) {

  }

  deleteSong(id: any) {

  }
}
