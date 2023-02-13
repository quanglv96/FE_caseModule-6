import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../service/user/user.service";
import {User} from "../model/User";
import {Router} from "@angular/router";
import {Location} from "@angular/common";

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
              private location: Location) {
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
        alert("dang ky thanh cong")
        this.switchToLogin()
        this.loginForm.patchValue(data)
      }, error => {
        alert("tai khoan da ton tai")
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
        alert("Login Successful")
        return this.router.navigateByUrl('')
      }, (error: any) => {
        console.log(error)
        alert(error['error']);
      })
    }
  }

  back() {
    this.location.back();
  }
}
