import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../service/user/user.service";
import {User} from "../model/User";
import {DataService} from "../service/data/data.service";
import SwAl from "sweetalert2";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  avatar = ""
  @Input() textSearch: string | any

  constructor(private router: Router,
              private userService: UserService,
              private dataService: DataService) {
  }

  // @ts-ignore
  routeSearch() {
    if (this.textSearch != undefined) {
      return this.router.navigateByUrl(`search/${this.textSearch}`)
    }
  }

  ngOnInit(): void {
    this.dataService.currentMessage.subscribe(message => {
      if (message == "clearSearch") {
        this.textSearch = "";
      }
      if (message.search("textSearch: ") == 0) {
        this.textSearch = message.slice(12)
        console.log('text '+this.textSearch)
        console.log('mes '+ message.slice(12))
      }
      if (localStorage.getItem('idUser')) {
        this.userService.findById(localStorage.getItem('idUser')).subscribe((data: User) => {
          this.user = data
        })
      }
    })
    this.userService.userChange.subscribe(
      data => {
        this.user = data;
      }
    )

  }

  toTrending(){
    console.log(this.router)
this.router.navigateByUrl('/trending').finally()
  }
  logOut() {
    localStorage.removeItem('idUser');
    this.user = null;
    this.dataService.changeMessage('log out');
    SwAl.fire({
      title: 'Logout Successful',
      icon: "success",
      showConfirmButton: false,
      showCloseButton: false,
      timer: 1000,
      customClass: {
        title: 'success-message',
        popup: 'popup',
        confirmButton: 'confirm-btn',
        closeButton: 'close-btn'
      }
    }).then()
  }

  toLibrary() {
    if (!localStorage.getItem('idUser')) {
      this.router.navigateByUrl('auth').finally()
    } else {
      this.router.navigateByUrl('library').finally()
    }
  }
}
