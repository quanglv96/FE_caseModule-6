import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Params} from "@angular/router";
import {SearchService} from "../service/search/search.service";
import * as $ from "jquery";
import {Tags} from "../model/Tags";
import {TagsService} from "../service/tags/tags.service";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, AfterViewInit {
  search: [] = [];
  text: any;
  resultSearch: any[] = [];
  category:string ='';
  resultContent: string='';
  statisticalContent: string='Search for tracks, artists, podcasts, and playlists.';
  hintTag:Tags[]=[]

  constructor(private activatedRoute: ActivatedRoute,
              private searchService:SearchService,
              private tagService:TagsService,) {

  }

  ngOnInit(): void {
    let footerHeight = localStorage.getItem('footer-height') as string;
    let height = '100vh - ' + (parseInt(footerHeight) + 93) + 'px'
    $('.content').css('min-height', 'calc(' + height + ')')
    const routerPath = this.activatedRoute.routeConfig?.path
    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      this.resultSearch = [];
      if(routerPath == 'search/:textSearch'){
        const textSearch: string | null = param.get('textSearch');
        if (textSearch != '') {
          this.text = textSearch;
          this.result();
          this.resultContent = 'result for "' + this.text + '"'
          this.category = '';
        } else {
          this.resultContent = '';
          this.statisticalContent = 'Search for tracks, artists, podcasts, and playlists.';
        }
      }
      if (routerPath == "search/tag/:idTag/:nameTag") {
        this.getPlayAndSongByTag(param.get('idTag'),param.get('nameTag'))
      }
    })

    this.activatedRoute.params.subscribe(
      (params: Params) => {
        if (!!params['id']) {
          let tagId = +params['id']
          let tagName = params['name']
          this.getPlayAndSongByTag(tagId, tagName)
        }
      }
    )
    this.tagService.getHint5Tag().subscribe((listTag:Tags[])=>{
      this.hintTag=listTag;
    })
  }

  ngAfterViewInit() {
    let width = $('.sidebar').width();
    // @ts-ignore
    $('.sidebar-container').width(width);
  }

  fillCategory(text: string) {
    this.category = text;
  }

  getPlayAndSongByTag(id?: number | any, name?: string | any) {
    this.resultContent = 'result for "' + "#" + name + '"'
    this.searchService.getPlayAndSongByTag(id).subscribe((data: any) => {
      this.resultSearch=[]
      for (let i = 0; i < data.length; i++) {
        const demo = data[i]
        for (let j = 0; j < demo.length; j++) {
          this.resultSearch.push(demo[j]);
        }

      }
      this.statisticalContent = `Found ${data[0].length} Playlist, ${data[1].length} Songs`
    })
    this.tagService.getHint5Tag().subscribe((data) => {
      this.hintTag = data
    })
  }
  result() {
    this.searchService.resultSearch(this.text).subscribe((data:any)=>{
      this.resultSearch=[]
      for (let i = 0; i < data.length; i++) {
        const demo = data[i]
        for (let j = 0; j < demo.length; j++) {
          this.resultSearch.push(demo[j]);
        }
      }
      this.statisticalContent = `Found ${data[0].length} Songs, ${data[2].length} people, ${data[1].length} playlists`
    })
  }


}
