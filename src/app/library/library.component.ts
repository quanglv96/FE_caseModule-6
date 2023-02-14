import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {UserService} from "../service/user/user.service";
import {User} from "../model/User";
import SwAl from 'sweetalert2'

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {
  childPath: string = ''
  idUser: any;
  user: User | any;
  avatar:any;
  username:any
  btn_add:boolean=true;
  ngOnInit(): void {
    this.idUser = localStorage.getItem('idUser')
    this.userService.findById(this.idUser).subscribe((data:User) => {
      this.user = data;
      this.avatar = this.user.avatar
      this.username = this.user.username
    });
  }

  option = {
    customClass: {
      popup: '.popup',
    }
  }

  constructor(private router: Router,
              private userService: UserService) {
    router.events.subscribe(
      event => {
        if (event instanceof NavigationEnd) {
          let fullPath = event.url.split('/')
          this.childPath = fullPath[fullPath.length - 1];
        }
      }
    )
  }

  buttonADD(){
    this.btn_add = false
  }

  toAddForm() {
    console.log(this.childPath)
    if (this.childPath === 'song') {
      this.router.navigate(['/library/song/new']).finally()
    } else if (this.childPath === 'playlist') {
      this.router.navigate(['/library/playlist/new']).finally()
    }
  }

  test() {

    SwAl.fire({
      title: 'Register successfully',
      iconHtml: '<img style="width: 50px; height: 50px" src="https://icons.veryicon.com/png/o/miscellaneous/batch-editor/success-38.png">',
      showConfirmButton: true,
      showCloseButton: true,
      customClass: {
        icon: 'icon',
        actions: 'action',
        title: 'success-message',
        popup: 'popup',
        confirmButton: 'confirm-btn',
        closeButton: 'close-btn'
      }
    }).then(
      () => {
        this.router.navigate(['/']).finally()
      }
    )
  }
}
