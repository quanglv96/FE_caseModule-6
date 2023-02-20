import {AfterViewInit, Component, OnInit} from '@angular/core';
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
export class SearchComponent implements OnInit, AfterViewInit {
  search: [] = [];
  text:any;
  resultSearch: any[] = [];
  category:string ='';
  resultContent: string='';
  statisticalContent: string='Search for tracks, artists, podcasts, and playlists.';
  hintTag: Tags[] = []

  constructor(private activatedRoute: ActivatedRoute,
              private searchService:SearchService,
              private tagService:TagsService) {

  }

  ngOnInit(): void {
    let footerHeight = localStorage.getItem('footer-height') as string;
    let height = '100vh - ' + (parseInt(footerHeight) + 93) + 'px'
    $('.content').css('min-height', 'calc(' + height + ')')
    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      this.resultSearch = [];
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

    })
    this.tagService.getHint5Tag().subscribe((listTag:Tags[])=>{
      this.hintTag=listTag;
    })
  }

  ngAfterViewInit() {
    let width = $('.sidebar').width();
    // @ts-ignore
    $('.sidebar-container').width(width);
  }

  result() {
    this.searchService.resultSearch(this.text).subscribe((data:any)=>{
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

  fillCategory(text: string, index: number) {
    this.category = text;
    $('.filter-option.active').removeClass('active')
    $('.tab-' + index).addClass('active')
  }
}
