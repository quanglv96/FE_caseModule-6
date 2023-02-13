import {Component, OnInit} from '@angular/core';
import {SongsService} from "../service/songs/songs.service";

import {Songs} from "../model/Songs";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  slides: any = [
    '/assets/Untitled-1.jpg',
    '/assets/Untitled-2.jpg',
    '/assets/Untitled-3.jpg'
  ];

  songs : Songs[] = []


  constructor(private songService: SongsService) {

  }

  ngOnInit(): void {
    // @ts-ignore
    this.songService.listNewSongsByDate().subscribe((data: Songs[]) => {
      this.songs = data;
    })
  }

}
