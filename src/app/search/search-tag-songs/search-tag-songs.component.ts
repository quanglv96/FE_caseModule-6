import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {TagsService} from "../../service/tags/tags.service";
import {Songs} from "../../model/Songs";

@Component({
  selector: 'app-search-tag-songs',
  templateUrl: './search-tag-songs.component.html',
  styleUrls: ['./search-tag-songs.component.css']
})
export class SearchTagSongsComponent implements OnInit {
  listSongByTag : Songs[] = [];
  id : number;


  constructor(private activatedRoute : ActivatedRoute,
              private tagsService: TagsService) {
  }

  ngOnInit(): void {
  }

  resultSearchByTag() {
    this.tagsService.findSongsByTags(id)
  }

}
