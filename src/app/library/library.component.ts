import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {UserService} from "../service/user/user.service";
import {User} from "../model/User";
import {DataService} from "../service/data/data.service";
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
  countSongsByUser: any;
  countPlaylistByUser: any;
  ngOnInit(): void {
    this.dataService.currentMessage.subscribe(()=>{
      this.idUser = localStorage.getItem('idUser');
      this.userService.findById(this.idUser).subscribe((data:User)=>{
        this.user=data;
        this.avatar=this.user.avatar
        this.username=this.user.username
        // @ts-ignore
        this.userService.countByUser(this.idUser).subscribe((data:number[])=>{
          this.countPlaylistByUser=data[0];
          this.countSongsByUser=data[1];
        })
      });
    })
      }

  option = {
    customClass: {
      popup: '.popup',
    }
  }

  constructor(private router: Router,
              private userService: UserService,
              private dataService:DataService) {
    router.events.subscribe(
      event => {
        if (event instanceof NavigationEnd) {
          let fullPath = event.url.split('/')
          this.childPath = fullPath[fullPath.length - 1];
        }
      }
    )
  }
  toAddForm() {
    console.log(this.childPath)
    if (this.childPath === 'song') {
      this.router.navigate(['/library/song/new']).finally()
    } else if (this.childPath === 'playlist') {
      this.router.navigate(['/library/playlist/new']).finally()
    }
  }

}
