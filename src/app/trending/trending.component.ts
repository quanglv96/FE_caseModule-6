import {Component, OnInit} from '@angular/core';
import {Songs} from "../model/Songs";
import {OwlOptions} from "ngx-owl-carousel-o";
import * as $ from 'jquery'
import {SongsService} from "../service/songs/songs.service";
import {Playlist} from "../model/Playlist";
import {PlaylistService} from "../service/playlist/playlist.service";

@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.css']
})
export class TrendingComponent implements OnInit {
  topSongs: Songs[] = []
  newSongs: Songs[] = []
  topPlaylists: Playlist[] = []
  newPlaylists: Playlist[] = []

  constructor(private songService: SongsService,
              private playlistService: PlaylistService) {

  }

  ngOnInit() {
    this.songService.getTopSongs().subscribe(
      data => {
        this.topSongs = data;
      }
    )
    this.songService.getNewSongs().subscribe(
      data => {
        this.newSongs = data;
      }
    )
    this.playlistService.getTopPlaylist().subscribe(
      data => {
        this.topPlaylists = data;
      }
    )
    this.playlistService.getNewPlaylist().subscribe(
      data => {
        this.newPlaylists = data;
      }
    )
  }
}
