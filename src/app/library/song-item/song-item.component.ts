import {Component, OnInit} from '@angular/core';
import {SongsService} from "../../service/songs/songs.service";
import {Songs} from "../../model/Songs";
import {DataService} from "../../service/data/data.service";
import {Router} from "@angular/router";

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

  }

  addPlayList(id: any) {

  }

  deleteSong(id: any) {
    this.songService.deleteSong(id).subscribe(()=>{
      this.dataService.changeMessage("delete");
      return this.router.navigateByUrl('/library/song');
    })
  }
}
