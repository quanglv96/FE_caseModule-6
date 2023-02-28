import {OwlOptions} from "ngx-owl-carousel-o";
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {SongsService} from "../service/songs/songs.service";
import {Songs} from "../model/Songs";
import {DataService} from "../service/data/data.service";
import {Router} from "@angular/router";
import {IRegionPositions, ITimeUpdateEvent, NgWaveformComponent} from "ng-waveform";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  slides: any = [
    '/assets/Untitled-1.jpg',
    '/assets/Untitled-2.jpg',
    '/assets/Untitled-3.jpg'
  ];
// chạy slide
  options: OwlOptions = {
    items: 1,
    slideBy: 1,
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplaySpeed: 1000,
  }

  songs: Songs[] = []
  statusLogin: boolean=false;

  constructor(private songService: SongsService,
              private dataService:DataService,
              private router:Router) {

  }
  @Input() textSearch: string | any
  ngOnInit(): void {
    this.dataService.currentMessage.subscribe(message=>{
      if(localStorage.getItem('idUser')){
        this.statusLogin=true;
      }
      if(message=="log out"){
        this.statusLogin=false;
      }
      this.songService.listTop10SongsTrending().subscribe((data: Songs[]) => {
        this.songs = data;
      })
    })
    this.dataService.changeMessage("clearSearch");
    this.dataService.changeMessage('onPlay')

  }
  routeSearch() {
    if (this.textSearch != undefined) {
      this.dataService.changeMessage("textSearch: "+this.textSearch)
      this.router.navigateByUrl(`search/${this.textSearch}`).finally()
    }
  }
}
