import {Component, Input} from '@angular/core';
import { Router} from "@angular/router";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent{
    user = false;
    @Input() textSearch:string|any
  constructor(private route:Router) {
  }
    routeSearch(){
      if(this.textSearch==undefined){
        this.textSearch='';
      }
      return this.route.navigateByUrl(`search/${this.textSearch}`)
    }
}
