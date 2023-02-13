import {Component, Input, OnInit} from '@angular/core';

import {User} from "../../model/User";

@Component({
  selector: 'app-search-item-user',
  templateUrl: './search-item-user.component.html',
  styleUrls: ['./search-item-user.component.css']
})
export class SearchItemUserComponent implements OnInit {
  @Input('user') user:User|any;
  id?:string;
  username?:string;
  password?:string;
  name?:string;
  address?:string;
  email?:string;
  phone?:string;
  avatar?:string;
  ngOnInit(): void {
    this.name=this.user.name
    this.username=this.username
  }
}
