import {Component, Input, OnInit} from '@angular/core';

import {Playlist} from "../../model/Playlist";
import {Songs} from "../../model/Songs";
import {User} from "../../model/User";
import {Tags} from "../../model/Tags";

@Component({
  selector: 'app-search-item-playlist',
  templateUrl: './search-item-playlist.component.html',
  styleUrls: ['./search-item-playlist.component.css']
})
export class SearchItemPlaylistComponent implements OnInit{
  @Input('playlist') playlist:Playlist|any;
  id?:string;
  name?:string
  description?:string;
  avatar?:string;
  users?:User;
  likes?:number;
  tagsList?:Tags[];
  views?:number;
  userLikesPlaylist?:User[];

  ngOnInit(): void {
    this.id = this.playlist.id;
    this.name = this.playlist.name;
    this.users = this.playlist.users.name;
    // this.date = this.playlist.date;
    // this.tags = this.toStringTag(this.playlist.tagsList);
    this.likes = this.playlist.userLikesPlaylist.length;
    this.avatar = this.playlist.avatar;
  }

  toStringTag(listTag: Tags[]) {
    let content = '';
    for (let i = 0; i < listTag.length; i++) {
      content += '#' + listTag[i].name + ' ';
    }
    return content;
  }
}
