import { Component } from '@angular/core';

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

  songs = new Array(10)
}
