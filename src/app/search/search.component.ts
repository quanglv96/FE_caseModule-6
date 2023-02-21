import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from "@angular/router";
import {SearchService} from "../service/search/search.service";
import * as $ from "jquery";
import {Tags} from "../model/Tags";
import {TagsService} from "../service/tags/tags.service";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  search: [] = [];
  text: any;
  resultSearch: any[] = [];
  category: string = '';
  resultContent: string = '';
  statisticalContent: string = 'Search for tracks, artists, podcasts, and playlists.';
  hintTag: Tags[] = []

  constructor(private activatedRoute: ActivatedRoute,
              private searchService: SearchService,
              private tagService: TagsService) {

  }

  ngOnInit(): void {
    if(-1){
      console.log(true)
    }
    let footerHeight = localStorage.getItem('footer-height') as string;
    let height = '100vh - ' + (parseInt(footerHeight) + 93) + 'px'
    $('.content').css('min-height', 'calc(' + height + ')')
    const routerPath = this.activatedRoute.routeConfig?.path
    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      if (routerPath == 'search/:textSearch') {
        this.searchText(param.get('textSearch'))
      }
      if (routerPath == "search/tag/:idTag/:nameTag") {
        this.searchTag(param.get('idTag'),param.get('nameTag'))
      }
    })
    this.tagService.getHint5Tag().subscribe((listTag: Tags[]) => {
      this.hintTag = listTag;
    })
  }

  searchTag(idTag: string | null, nameTag:string|null) {
    this.resultSearch=[];
    this.searchService.findAllByTag(idTag).subscribe((data: any) => {
      this.text =nameTag;
      this.random(data)
      this.statisticalContent = `Found ${data[0].length} Songs, ${data[1].length} playlists`
      this.resultContent = 'Result for Tag "' + this.text + '"'
      this.category = '';
      this.fillCategory(this.category)
    })
  }
  searchText(text: string | null) {
    this.resultSearch = [];
    const textSearch: string | null = text;
    if (textSearch != '') {
      this.text = textSearch;
      this.result();
      this.resultContent = 'Result for "' + this.text + '"'
      this.category = '';
      this.fillCategory(this.category)
    } else {
      this.resultContent = '';
      this.statisticalContent = 'Search for tracks, artists, podcasts, and playlists.';
    }
  }

  ngAfterViewInit() {
    let width = $('.sidebar').width();
    // @ts-ignore
    $('.sidebar-container').width(width);
  }

  result() {
    this.searchService.resultSearch(this.text).subscribe((data: any) => {
      this.random(data)
      this.statisticalContent = `Found ${data[0].length} Songs, ${data[2].length} people, ${data[1].length} playlists`
    })
  }

  random(data: any) {

    let index: number = 0;
    let list: any = [];
    let random: any = []
    for (let i = 0; i < data.length; i++) {
      const demo = data[i]
      for (let j = 0; j < demo.length; j++) {
        list.push(demo[j]);
      }
    }
    const demoRandom: any = [];
    while (index != list.length) {
      demoRandom[index] = Math.floor(Math.random() * list.length);
      random = Array.from(new Set(demoRandom));
      index = random.length;
    }
    for (let i = 0; i < random.length; i++) {
      this.resultSearch.push(list[random[i]]);
    }
  }

  fillCategory(text: string) {
    const category=['singer','playlist','users','songs','']
    this.category = text;
    for (let i = 0; i <category.length ; i++) {
      $('.selectCategory-'+category[i]).removeClass('selectCategory')
      if(text==category[i]){
        $('.selectCategory-'+text).addClass('selectCategory')
      }
    }
  }


}
