import { Component } from '@angular/core';
import { OwlOptions } from "ngx-owl-carousel-o";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  slides: any = [
    '/assets/Untitled-1.jpg',
    '/assets/Untitled-2.jpg',
    '/assets/Untitled-3.jpg'
  ];

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

  songs = new Array(10)
}
