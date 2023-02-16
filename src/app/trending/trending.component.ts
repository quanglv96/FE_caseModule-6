import {Component, OnInit} from '@angular/core';
import {Songs} from "../model/Songs";
import {SongsService} from "../service/songs/songs.service";
import {Playlist} from "../model/Playlist";
import {PlaylistService} from "../service/playlist/playlist.service";

@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.css']
})
export class TrendingComponent implements OnInit {
  topViewSongs: Songs[] = []
  newSongs: Songs[] = []
  topLikeSongs: Songs[] = []
  topPlaylists: Playlist[] = []
  newPlaylists: Playlist[] = []
  topLikePlaylists: Songs[] = []

  constructor(private songService: SongsService,
              private playlistService: PlaylistService) {

  }

  ngOnInit() {
    this.songService.getTopSongs().subscribe(
      data => {
        this.topViewSongs = data;
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