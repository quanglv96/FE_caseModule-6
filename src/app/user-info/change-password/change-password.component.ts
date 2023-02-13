import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  changePassForm = this.formBuilder.group({
    password: ['', {validators: [Validators.required, Validators.minLength(6)], updateOn: 'blur'}],
    newPassword: ['', {validators: [Validators.required, Validators.minLength(6), this.changePassValidator.bind(this)], updateOn: 'blur'}],
    confirmNewPassword: ['', {validators: [Validators.required, this.confirmPassValidator.bind(this)], updateOn: 'blur'}]
  });

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.changePassForm.controls['password'].valueChanges.subscribe(
      () => {
        this.changePassForm.controls['newPassword'].updateValueAndValidity();
      }
    )
    this.changePassForm.controls['newPassword'].valueChanges.subscribe(
      () => {
        this.changePassForm.controls['confirmNewPassword'].updateValueAndValidity();
      }
    )
  }

  confirmPassValidator(control: FormControl): {[s: string]: boolean} | null {
    // @ts-ignore
    if (control.value !== '' && control.value !== control?.parent?.controls?.['newPassword'].value) {
      return {'notMatch': true};
    }
    return null
  }

  changePassValidator(control: FormControl): {[s: string]: boolean} | null {
    // @ts-ignore
    if (control.value !== '' && control.value === control?.parent?.controls?.['password'].value) {
      return {'notChange': true};
    }
    return null
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

  saveChange() {
    if (!this.changePassForm.valid) {
      Object.keys(this.changePassForm.controls).forEach(field => {
        const control = this.changePassForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
    } else {

      // code phan update user o day

    }
  }

}
