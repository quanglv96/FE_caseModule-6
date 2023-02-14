import {Component, OnInit} from '@angular/core';
import {Songs} from "../../model/Songs";
import {Playlist} from "../../model/Playlist";
import {PlaylistService} from "../../service/playlist/playlist.service";
import {Router} from "@angular/router";
import {DataService} from "../../service/data/data.service";

@Component({
  selector: 'app-playlist-item',
  templateUrl: './playlist-item.component.html',
  styleUrls: ['./playlist-item.component.css']
})
export class PlaylistItemComponent implements OnInit {
  idUser: any = null;
  listPlaylist: Playlist[] = [];

  constructor(private dataService: DataService, private playlistService: PlaylistService, private router: Router) {
  }

  ngOnInit(): void {
    this.dataService.currentMessage.subscribe(() => {
      this.idUser = localStorage.getItem('idUser')
      if (this.idUser) {
        this.playlistService.getPlaylistByUser(this.idUser).subscribe((data: Songs[]) => {
          this.listPlaylist = data;
        })
      }
    })
  }

  editPlaylist(id: number | any) {
    return this.router.navigateByUrl("/library/playlist/edit/" + id)
  }

  deletePlaylist(id: number | any) {
    this.playlistService.deletePlaylist(id).subscribe(() => {
        this.dataService.changeMessage("save thành công");
        return this.router.navigateByUrl('/library/playlist')
      }
    )
  }
}
