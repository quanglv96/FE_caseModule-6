import { OwlOptions } from "ngx-owl-carousel-o";
import { Component, OnInit } from '@angular/core';
import { SongsService } from "../service/songs/songs.service";

import {Songs} from "../model/Songs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  slides: any = [
    '/assets/Untitled-1.jpg',
    '/assets/Untitled-2.jpg',
    '/assets/Untitled-3.jpg'
  ];

  options: OwlOptions = {
    items: 1,
    slideBy: 1,
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplaySpeed: 1000,
  }

  songs: Songs[] = []

  constructor(private songService: SongsService, private router: Router) {

  }

  ngOnInit(): void {
      this.router.navigateByUrl('header')
    // @ts-ignore
    this.songService.listTop10SongsTrending().subscribe((data: Songs[]) => {
      this.songs = data;
    })
  }

}
