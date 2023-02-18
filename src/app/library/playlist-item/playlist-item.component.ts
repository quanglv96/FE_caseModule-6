import {Component, OnInit} from '@angular/core';
import {Songs} from "../../model/Songs";
import {Playlist} from "../../model/Playlist";
import {PlaylistService} from "../../service/playlist/playlist.service";
import {Router} from "@angular/router";
import {DataService} from "../../service/data/data.service";
import SwAl from "sweetalert2";

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
  confirmDelete( id: number | any, name: string|any){
    // @ts-ignore
     return SwAl.fire({
      title: `Are you sure delete Playlist: "${name}"?`,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF4500FF",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel please!",
      closeOnConfirm: false,
      closeOnCancel: false
    }).then(result=>{
      if(result.isConfirmed){
        this.deletePlaylist(id)
      }else if (result.isDenied) {
        SwAl.fire('Changes are not saved', '', 'info').then()
      }
     });
  }
  deletePlaylist(id: number | any) {
      this.playlistService.deletePlaylist(id).subscribe(() => {
        SwAl.fire({
          title: `Delete Success`,
          icon:"success",
          showCancelButton: false,
          showCloseButton: false,
          timer:2000,
          customClass: {
            title: 'error-message',
            popup: 'popup',
            confirmButton: 'confirm-btn',
            closeButton: 'close-btn'
          }
        }).then();
          this.dataService.changeMessage("Save Success");
          return this.router.navigateByUrl('/library/playlist')
        }
      )
    }
}
