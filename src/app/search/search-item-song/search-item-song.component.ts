import {Component, Input, OnInit} from '@angular/core';
import {faPlayCircle} from "@fortawesome/free-solid-svg-icons";
import {Songs} from "../../model/Songs";
import {User} from "../../model/User";
import {Singer} from "../../model/Singer";
import {Tags} from "../../model/Tags";

@Component({
  selector: 'app-search-item-song',
  templateUrl: './search-item-song.component.html',
  styleUrls: ['./search-item-song.component.css']
})
export class SearchItemSongComponent implements OnInit {
  faPlay = faPlayCircle
  @Input('song') song: Songs | any;
  id!: string;
  name!: string
  audio!: string;
  tags!:string;
  likes!:number;
  avatar?: string;
  users!: User;
  date!: Date;
  tagsList!: Tags[];
  views!: number;

  ngOnInit(): void {
    this.id = this.song.id;
    this.name = this.song.name;
    this.users = this.song.users.name;
    this.date = this.song.date;
    this.tags = this.toStringTag(this.song.tagsList);
    this.likes = this.song.userLikeSong.length;
    this.avatar = this.song.avatar;
  }

  toStringTag(listTag: Tags[]) {
    let content = '';
    for (let i = 0; i < listTag.length; i++) {
      content += '#' + listTag[i].name + ' ';
    }
    return content;
  }

  playSong(id: any) {

  }
}
