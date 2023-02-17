import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as $ from 'jquery'
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {User} from "../../model/User";
import {UserService} from "../../service/user/user.service";
import {Router} from "@angular/router";
import {FileUploadService} from "../../service/file-upload.service";
import {DataService} from "../../service/data/data.service";
import SwAl from "sweetalert2";


@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  editImage?: string | ArrayBuffer | null;
  user: any | User;
  idUser: number | any;
  avatar!: any;
  @ViewChild('userAvatar') userAvatar?: ElementRef


  userForm = this.formBuilder.group({
    name: ['', {validators: Validators.required, updateOn: 'blur'}],
    email: ['', {validators: [Validators.required, Validators.email], updateOn: 'blur'}],
    address: [''],
    phone: ['', {validators: [Validators.required, this.phoneValidator.bind(this)], updateOn: 'blur'}],
  });

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private router: Router,
              private fileUpload: FileUploadService,
              private dataService: DataService) {
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

  ngOnInit(): void {
    // @ts-ignore
    this.dataService.currentMessage.subscribe((message: string) => {
      switch (message) {
        case "log out":
          return this.router.navigateByUrl('');
      }
    })
    this.dataService.currentMessage.subscribe(() => {
      this.idUser = localStorage.getItem("idUser");
      this.userService.findById(this.idUser).subscribe(data => {
        this.user = data;
        this.getImage()
        this.userForm.patchValue(this.user);
      })
    })
  }

  saveChange() {
    SwAl.fire('Please wait').then();
    SwAl.showLoading()

    if (!this.userForm.valid) {
      Object.keys(this.userForm.controls).forEach(field => {
        const control = this.userForm.get(field);
        control?.markAsTouched({onlySelf: true});
      });
    } else {
      this.user = this.userForm.value as User
      let files = this.userAvatar?.nativeElement.files[0]
      // đk: có up file(bao gồm cả mp3 và img)
      if (files) {
        // check up k phải file ảnh
        if (files.name.includes('mp3')) {
          SwAl.fire({
            title: 'Avatar file must format .jpg',
            icon: "error",
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
              title: 'error-message',
              popup: 'popup',
              confirmButton: 'confirm-btn',
              closeButton: 'close-btn'
            }
          }).then()
        } else {
          // lấy url file ảnh
          this.fileUpload.pushFileToStorage('image/users', files).subscribe(url => {
            //tạo đối tượng user mới sau khi edit
            this.createNewUser(url)
          })
        }
      } else {
        // tạo mới đối tượng user. dùng avt cũ
        this.createNewUser(this.user.avatar)
      }
    }
  }

  createNewUser(pathAvt: string) {
    this.user = {
      id: localStorage.getItem('idUser'),
      name: this.userForm.value.name,
      address: this.userForm.value.address,
      email: this.userForm.value.email,
      phone: this.userForm.value.phone,
      avatar: pathAvt
    }
    this.userService.updateUser(localStorage.getItem('idUser'), this.user).subscribe(data => {
      this.dataService.changeMessage("changeInfoUser")
      SwAl.fire({
        title: 'Update Successful',
        icon: "success",
        showConfirmButton: false,
        showCloseButton: false,
        timer: 1500,
        customClass: {
          title: 'success-message',
          popup: 'popup',
          confirmButton: 'confirm-btn',
          closeButton: 'close-btn'
        }
      }).then()
      return this.router.navigateByUrl('/user-info/edit')
    })
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


  getImage() {
    const image =!!this.user.avatar ? this.user.avatar : 'assets/avt-default.png'
    return !!this.editImage ? this.editImage : image;
  }

  clearForm() {
    this.userForm.patchValue(this.user);
  }

}
