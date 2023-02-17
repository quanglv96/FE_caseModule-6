import {Component, Input, OnInit} from '@angular/core';
import {faPlayCircle} from "@fortawesome/free-solid-svg-icons";
import {Songs} from "../../model/Songs";
import {Tags} from "../../model/Tags";
import {Router} from "@angular/router";

@Component({
  selector: 'app-search-item-song',
  templateUrl: './search-item-song.component.html',
  styleUrls: ['./search-item-song.component.css']
})
export class SearchItemSongComponent implements OnInit {
  faPlay = faPlayCircle
  @Input('song') song: Songs | any;
  tagString: string | any;

  ngOnInit(): void {
    this.tagString = this.toStringTag(this.song.tagsList);
  }

  toStringTag(listTag: Tags[]) {
    let content = '';
    for (let i = 0; i < listTag.length; i++) {
      content += '#' + listTag[i].name + ' ';
    }
    return content;
  }

  constructor(private router: Router) {
  }

  playSong(id: any) {

  }

  redirectSongDetail(id: any) {
    return this.router.navigateByUrl('song/' + id)
  }
}
