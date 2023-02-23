import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Params} from "@angular/router";
import {SearchService} from "../service/search/search.service";
import * as $ from "jquery";
import {Tags} from "../model/Tags";
import {TagsService} from "../service/tags/tags.service";
import {LoadMoreService} from "../service/loadMore/load-more.service";
import {Observable} from "rxjs";


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, AfterViewInit {
  search: [] = [];
  text: any;
  resultSearch: any[] = [];
  category: string = '';
  resultContent: string = '';
  statisticalContent: string = 'Search for tracks, artists, podcasts, and playlists.';
  hintTag: Tags[] = []

  constructor(private activatedRoute: ActivatedRoute,
              private searchService: SearchService,
              private tagService: TagsService,
              private LoadMoreService: LoadMoreService) {
    this.resultSearch$ = LoadMoreService.result$
  }

  ngOnInit(): void {
    let footerHeight = localStorage.getItem('footer-height') as string;
    let height = '100vh - ' + (parseInt(footerHeight) + 93) + 'px'
    $('.content').css('min-height', 'calc(' + height + ')')
    const routerPath = this.activatedRoute.routeConfig?.path
    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      this.resultSearch = [];
      if (routerPath == 'search/:textSearch') {
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
      if (routerPath == "search/tags/:idTag/:nameTag") {
        this.getPlayAndSongByTag(param.get('idTag'), param.get('nameTag'))
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
    this.tagService.getHint5Tag().subscribe((listTag: Tags[]) => {
      this.hintTag = listTag;
    })
  }

  ngAfterViewInit() {
    let width = $('.sidebar').width();
    // @ts-ignore
    $('.sidebar-container').width(width);
  }

  listAll: Object[] = []

  getPlayAndSongByTag(id ?: number | any, name ?: string | any) {
    this.resultContent = 'result for tag: "' + "#" + name + '"'
    this.searchService.getPlayAndSongByTag(id).subscribe((data: any) => {
      this.category = ''
      this.resultSearch = this.pushResultAndSortList(data)
      this.listAll = this.resultSearch
      this.loadMore([], this.resultSearch)
      this.statisticalContent = `Found ${data[0].length} Playlist, ${data[1].length} Songs`
    })
    this.tagService.getHint5Tag().subscribe((data) => {
      this.hintTag = data
    })
  }

  result() {
    this.searchService.resultSearch(this.text).subscribe((data: any[]) => {
      this.resultSearch = this.pushResultAndSortList(data)
      this.listAll = this.resultSearch
      this.loadMore([], this.resultSearch)
      this.statisticalContent = `Found ${data[0].length} Songs, ${data[2].length} people, ${data[1].length} playlists`
    })
  }

  pushResultAndSortList(data: any[]) {
    let list: Object[] = []
    for (let i = 0; i < data.length; i++) {
      const demo = data[i]
      for (let j = 0; j < demo.length; j++) {
        list.push(demo[j]);
      }
    }
    list.sort((a, b) => {
      // @ts-ignore
      if (a['name'].toLowerCase() < b['name'].toLowerCase()) {
        return -1;
      }
      // @ts-ignore
      if (a['name'].toLowerCase() > b['name'].toLowerCase()) {
        return 1;
      }
      return 0;
    })
    return list
  }

  dataShow: [] = []
  resultSearch$: Observable<Array<Object>>;

  fillCategory(text: string) {
    let list = []
    window.scrollTo(0, 0)
    this.category = text;
    for (let i = 0; i < this.resultSearch.length; i++) {
      switch (this.category) {
        case "songs":
          if (this.resultSearch[i].audio) {
            list.push(this.resultSearch[i]);
          }
          break;
        case "playlist":
          if (this.resultSearch[i].description) {
            list.push(this.resultSearch[i]);
          }
          break;
        case "users":
          if (this.resultSearch[i].username) {
            list.push(this.resultSearch[i]);
          }
          break;
        default:
          list = this.resultSearch
          break;
      }
    }
   this.listAll=list
    this.loadMore([], list)
  }
  loadMore(dataShow: Object[], listAll: Object[]) {

    let count = true;
    this.LoadMoreService.onload(dataShow, listAll)
    // @ts-ignore
    this.resultSearch$.subscribe((data: []) => {
      if (count) {
        count = false;
        return this.dataShow = data;

      }
    })
  }
}
