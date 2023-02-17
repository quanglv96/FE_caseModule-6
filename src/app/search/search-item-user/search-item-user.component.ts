import {Component, Input, OnInit} from '@angular/core';

import {User} from "../../model/User";

@Component({
  selector: 'app-search-item-user',
  templateUrl: './search-item-user.component.html',
  styleUrls: ['./search-item-user.component.css']
})
export class SearchItemUserComponent implements OnInit {
  @Input('user') user:User|any;
  ngOnInit(): void {

  }
}
