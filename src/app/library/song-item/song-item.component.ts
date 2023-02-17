import {Component, OnInit} from '@angular/core';
import {SongsService} from "../../service/songs/songs.service";
import {Songs} from "../../model/Songs";
import {DataService} from "../../service/data/data.service";
import {Router} from "@angular/router";
import SwAl from "sweetalert2";

@Component({
  selector: 'app-song-item',
  templateUrl: './song-item.component.html',
  styleUrls: ['./song-item.component.css']
})
export class SongItemComponent implements OnInit {
  idUser: any = null;
  listSongs: Songs[] = [];

  constructor(private songService: SongsService,
              private dataService:DataService,
              private router:Router) {
  }

  ngOnInit(): void {
    this.dataService.currentMessage.subscribe(()=>{
      this.idUser = localStorage.getItem('idUser')

      if (this.idUser) {
        // @ts-ignore
        this.songService.findSongByUser(this.idUser).subscribe((data: Songs[]) => {
          this.listSongs = data;
        })
      }
    })
  }
  likeSong(id: any) {

  }

  editSong(id: any) {
    return this.router.navigateByUrl("/library/song/edit/" + id)
  }

  addPlayList(id: any) {

  }
  confirmDelete( id: number | any, name: string|any){
    // @ts-ignore
    return SwAl.fire({
      title: `Are you sure delete song: "${name}"?`,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel please!",
      closeOnConfirm: false,
      closeOnCancel: false
    }).then(result=>{
      if(result.isConfirmed){
        this.deleteSong(id)
      }else if (result.isDenied) {
        SwAl.fire('Changes are not saved', '', 'info').then()
      }
    });
  }
  deleteSong(id: any) {
    SwAl.fire({
      title: `Delete Success`,
      icon:"success",
      showCancelButton: false,
      showCloseButton: false,
      timer:2000
    }).then();
    this.songService.deleteSong(id).subscribe(()=>{
      this.dataService.changeMessage("delete");
      return this.router.navigateByUrl('/library/song');
    })
  }
}
