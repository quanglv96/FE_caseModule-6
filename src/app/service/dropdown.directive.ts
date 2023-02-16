import {Directive, ElementRef, HostBinding, HostListener} from '@angular/core';

@Directive({
  selector: '[dropdown]'
})
export class DropdownDirective {

  @HostBinding('class.open') isOpen:boolean = false;

  constructor(private element: ElementRef) { }

  @HostListener('document:click', ['$event']) toggleOpen(event: Event) {
    let elementClick = event.target as HTMLElement;
    this.isOpen = this.element.nativeElement.contains(elementClick) ? !this.isOpen : false;
  }
}
