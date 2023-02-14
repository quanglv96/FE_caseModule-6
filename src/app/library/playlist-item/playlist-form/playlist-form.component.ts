import {Component, Input} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Tags} from "../../../model/Tags";
import * as $ from "jquery";

@Component({
  selector: 'app-playlist-form',
  templateUrl: './playlist-form.component.html',
  styleUrls: ['./playlist-form.component.css']
})
export class PlaylistFormComponent {
  playlistImage: any

  formPlaylist: FormGroup = new FormGroup({
    avatar: new FormControl('https://thumbs.dreamstime.com/b/music-collection-line-icon-playlist-outline-logo-illustr-illustration-linear-pictogram-isolated-white-90236357.jpg'),
    name: new FormControl('', Validators.required),
    users:new FormControl(),
    description: new FormControl(''),
    tagsList: new FormControl([])
  })
  titleContent: string = 'Create new playlist';
 @Input() stringTag: string | any;

  submitForm() {
    this.formPlaylist.setValue({
      users:{id:localStorage.getItem('idUser')},
      tagsList: this.editStringTag(this.stringTag)
    })
    console.log('form'+ this.formPlaylist);
  }

  editStringTag(stringTag: string) {
    let list = stringTag.split("#")
    for (let i = 1; i < list.length; i++) {
      if (list[i] !== "") {
        //xóa khoảng trắng
        list[i] = list[i].replaceAll(" ", "");
        // lowe case
        list[i] = list[i].toLowerCase();
      }
    }
    list = Array.from(new Set(list));
    let tag: Tags[] = [];
    for (let i = 0; i < list.length; i++) {
      if(list[i]!=""){
        // @ts-ignore
        tag.push({id:null, name:list[i]})
      }
    }
    return tag;
  }

  openUpload(s: string) {
    $(s).trigger('click')
  }

  renderImagePath(event: any) {
    const files = event.target.files;
    const reader = new FileReader()
    if (files && files[0]) {
      reader.onload = () => {
        this.playlistImage = reader.result
      }
      reader.readAsDataURL(files[0])
    }
  }

}
