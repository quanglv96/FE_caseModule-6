import {Component, OnInit} from '@angular/core';
import * as $ from 'jquery'
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {User} from "../../model/User";
import {UserService} from "../../service/user/user.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  editImage: string | ArrayBuffer | null = ''
  user: any | User;
  idUser: number | any;

  userForm = this.formBuilder.group({
    username: [''],
    name: ['', {validators: Validators.required, updateOn: 'blur'}],
    email: ['', {validators: [Validators.required, Validators.email], updateOn: 'blur'}],
    address: [''],
    phone: ['', {validators: [Validators.required, this.phoneValidator.bind(this)], updateOn: 'blur'}],
    avatar: ['']
  });

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private router: Router) {
  }

  openUpload(s: string) {
    $(s).trigger('click')
  }

  renderImagePath(event: any) {
    const files = event.target.files;
    const reader = new FileReader()
    if (files && files[0]) {
      reader.onload = () => {
        this.editImage = reader.result
      }
      reader.readAsDataURL(files[0])
    }
  }

  saveChange() {
    if (!this.userForm.valid) {
      Object.keys(this.userForm.controls).forEach(field => {
        const control = this.userForm.get(field);
        control?.markAsTouched({onlySelf: true});
      });
    } else {
      this.user = this.userForm.value as User
      this.userService.updateUser(this.idUser, this.user).subscribe((data) => {
        this.userService.userChange.emit(data)
        alert("change succses")
      })
    }
  }


  clearValid(event: Event, messDiv: HTMLDivElement) {
    let input = event.target as HTMLInputElement
    input.classList.add('clear')
    messDiv.classList.add('hide')
  }

  checkValid(event: FocusEvent, messDiv: HTMLDivElement) {
    let input = event.target as HTMLInputElement
    input.classList.remove('clear')
    messDiv.classList.remove('hide')
  }

  phoneValidator(control: FormControl): { [s: string]: boolean } | null {
    let regexPattern = '^((84|0)[3|5|7|8|9])+([0-9]{8})$'
    let regex = new RegExp(regexPattern);
    if (control.value != '' && !regex.test(control.value)) {
      return {'invalidPhoneNumber': true}
    }
    return null
  }

  ngOnInit(): void {
    this.idUser = localStorage.getItem("idUser");
    this.userService.getUser(this.idUser).subscribe(data => {
      this.user = data;
      this.userForm.patchValue(this.user);
    })
    this.userService.userChange.subscribe(
      data => {
        this.user = data;
      }
    )
  }
}
