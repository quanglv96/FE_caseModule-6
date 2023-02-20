import {Component, Input, OnInit} from '@angular/core';

import {Playlist} from "../../model/Playlist";
import {Router} from "@angular/router";


@Component({
  selector: 'app-search-item-playlist',
  templateUrl: './search-item-playlist.component.html',
  styleUrls: ['./search-item-playlist.component.css']
})
export class SearchItemPlaylistComponent implements OnInit {
  @Input('playlist') playlist: Playlist | any;

  ngOnInit(): void {

  }

  constructor(private router: Router) {
  }

  redirectPlaylist(id: any) {
    return this.router.navigateByUrl('playlist/' + id)
  }
}
