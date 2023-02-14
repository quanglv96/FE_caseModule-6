import {Component, OnInit} from '@angular/core';
import {Songs} from "../../model/Songs";
import {Playlist} from "../../model/Playlist";
import {PlaylistService} from "../../service/playlist/playlist.service";

@Component({
  selector: 'app-playlist-item',
  templateUrl: './playlist-item.component.html',
  styleUrls: ['./playlist-item.component.css']
})
export class PlaylistItemComponent implements OnInit{
  idUser: any=null;
  listPlaylist: Playlist[] = [];
  constructor(private playlistService:PlaylistService) {
  }
  ngOnInit(): void {
    this.idUser=localStorage.getItem('idUser')
    if(this.idUser){
      this.playlistService.getPlaylistByUser(this.idUser).subscribe((data: Songs[]) => {
        this.listPlaylist = data;
      })
    }

  }

  editPlaylist(id: number|any) {

  }

  deletePlaylist(id: number|any) {

  }
}
