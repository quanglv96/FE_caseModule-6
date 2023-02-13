import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../service/user/user.service";
import {User} from "../model/User";
import * as path from "path";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  user:User|null=null;
  avatar=""
  @Input() textSearch: string | any

  constructor(private router: Router, private userService:UserService) {
  }

  routeSearch() {
    if (this.textSearch == undefined) {
      this.textSearch = '';
    }
    return this.router.navigateByUrl(`search/${this.textSearch}`)
  }

  ngOnInit(): void {
    if(localStorage.getItem('idUser')){
      this.userService.findById(localStorage.getItem('idUser')).subscribe((data:User)=>{
        this.user=data
      })
    }
  }

  logOut() {
    localStorage.removeItem('idUser');
    return this.router.navigateByUrl('/')
  }
}
