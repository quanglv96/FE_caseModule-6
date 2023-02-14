import {Component, OnInit} from '@angular/core';
import {UserService} from "../service/user/user.service";
import {User} from "../model/User";

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  idUser: number | any;
  user: User | any;
  name: any;
  username: string = '';
  avatar: string = '';

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.idUser = localStorage.getItem("idUser");
    this.userService.getUser(this.idUser).subscribe(data => {
      this.user = data;
      console.log(this.user)
      this.name = this.user.name
      this.username = this.user.username;
      this.avatar = this.user.avatar
    })
    this.userService.userChange.subscribe(
      data => {
        this.user = data
        this.name = data.name
        console.log(data)
      }
    )
  }

}
