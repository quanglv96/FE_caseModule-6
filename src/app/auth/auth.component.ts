import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../service/user/user.service";
import {User} from "../model/User";
import {Router} from "@angular/router";
import {Location} from "@angular/common";
import {DataService} from "../service/data/data.service";
import SwAl from 'sweetalert2'

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  username: string[] = []
  isLogin = true
  user?: User;

  loginForm: FormGroup = this.formBuilder.group({
    username: ['', {validators: Validators.required, updateOn: 'blur'}],
    password: ['', {validators: [Validators.required, Validators.minLength(6)], updateOn: 'blur'}]
  })

  registerForm: FormGroup = this.formBuilder.group({
    username: ['', {validators: [Validators.required, this.existUsernameValidator.bind(this)], updateOn: 'blur'}],
    password: ['', {validators: [Validators.required, Validators.minLength(6)], updateOn: 'blur'}],
    confirmPassword: ['', {validators: [Validators.required, this.confirmPassValidator.bind(this)], updateOn: 'blur'}],
    phone: ['', {validators: [Validators.required, this.phoneValidator.bind(this)], updateOn: 'blur'}]
  })

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private router: Router,
              private location: Location,
              private dataService: DataService) {
  }

  ngOnInit() {
    this.registerForm.controls['password'].valueChanges.subscribe(
      () => {
        this.registerForm.controls['confirmPassword'].updateValueAndValidity();
      }
    )
    this.userService.getUsername().subscribe(
      data => {
        this.username = data;
      }
    )
  }

  switchToLogin() {
    this.isLogin = true
  }

  switchToRegister() {
    this.isLogin = false
  }

  clearValid(event: Event, messDiv: HTMLDivElement) {
    let input = event.target as HTMLInputElement
    input.classList.add('clear')
    messDiv.classList.add('hide')
  }

  checkValid(event: Event, messDiv: HTMLDivElement) {
    let input = event.target as HTMLInputElement
    input.classList.remove('clear')
    messDiv.classList.remove('hide')
  }

  confirmPassValidator(control: FormControl): { [s: string]: boolean } | null {
    // @ts-ignore
    if (control.value !== '' && control.value !== control?.parent?.controls?.['password'].value) {
      return {'notMatch': true};
    }
    return null
  }

  phoneValidator(control: FormControl): { [s: string]: boolean } | null {
    let regexPattern = '^((84|0)[3|5|7|8|9])+([0-9]{8})$'
    let regex = new RegExp(regexPattern);
    if (control.value != '' && !regex.test(control.value)) {
      return {'invalidPhoneNumber': true}
    }
    return null
  }

  existUsernameValidator(control: FormControl): { [s: string]: boolean } | null {
    if (this.username?.includes(control.value)) {
      return {'usernameExist': true}
    }
    return null;
  }

  onRegister() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(field => {
        const control = this.registerForm.get(field);
        control?.markAsTouched({onlySelf: true});
      });
    } else {
      this.user = this.registerForm.value
      this.userService.register(this.user).subscribe(data => {
        SwAl.fire({
          title: 'Register successfully',
          icon: "success",
          showConfirmButton: false,
          showCloseButton: true,
          customClass: {
            title: 'success-message',
            popup: 'popup',
            confirmButton: 'confirm-btn',
            closeButton: 'close-btn'
          }
        }).then(
          () => {
            this.switchToLogin()
            this.loginForm.patchValue(data)
          }
        )
      }, error => {
        SwAl.fire({
          title: 'Account already exist',
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
      })
    }
  }

  onLogin() {
    if (!this.loginForm.valid) {
      Object.keys(this.loginForm.controls).forEach(field => {
        const control = this.loginForm.get(field);
        control?.markAsTouched({onlySelf: true});
      });
    } else {
      this.userService.login(this.loginForm.get('username')?.value, this.loginForm.get('password')?.value).subscribe(data => {
        localStorage.setItem('idUser', data.id)
        this.dataService.changeMessage('oke r')
        // return this.router.navigateByUrl("");
        SwAl.fire({
          title: 'Login successfully',
          icon: "success",
          showConfirmButton: false,
          showCloseButton: true,
          customClass: {
            title: 'success-message',
            popup: 'popup',
            confirmButton: 'confirm-btn',
            closeButton: 'close-btn'
          }
        }).then(
          () => {
            return this.router.navigateByUrl('/trending')
          }
        )
      }, (error: any) => {
        SwAl.fire({
          title: error['error'],
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
      })
    }
  }

  back() {
    this.location.back();
  }
}
