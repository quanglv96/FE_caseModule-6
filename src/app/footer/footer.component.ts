import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import * as $ from 'jquery'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  @Output() heightEvent = new EventEmitter<any>()

  ngOnInit() {
    let height = $('.footer').height();
    localStorage.setItem('footer-height', height as unknown as string);
  }
}
