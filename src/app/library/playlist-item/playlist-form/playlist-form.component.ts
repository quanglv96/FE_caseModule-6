import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import * as $ from "jquery";
import {FileUploadService} from "../../../service/file-upload.service";
import {Playlist} from "../../../model/Playlist";
import {PlaylistService} from "../../../service/playlist/playlist.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {DataService} from "../../../service/data/data.service";
import SwAl from "sweetalert2";
import {EditStringTagsService} from "../../../service/edit-string-tags.service";

@Component({
  selector: 'app-playlist-form',
  templateUrl: './playlist-form.component.html',
  styleUrls: ['./playlist-form.component.css']
})
export class PlaylistFormComponent implements OnInit {
  playlistImage: string | any = 'https://thumbs.dreamstime.com/b/music-collection-line-icon-playlist-outline-logo-illustr-illustration-linear-pictogram-isolated-white-90236357.jpg'
  formPlaylist: FormGroup = new FormGroup({
    avatar: new FormControl('https://thumbs.dreamstime.com/b/music-collection-line-icon-playlist-outline-logo-illustr-illustration-linear-pictogram-isolated-white-90236357.jpg'),
    name: new FormControl('', Validators.required),
    users: new FormControl(),
    description: new FormControl('', Validators.required),
    tagsList: new FormControl([], Validators.required)
  })
  titleContent: string = 'Create new playlist';
  @Input() stringTag: string | any;
  @ViewChild('avatar') avatar?: ElementRef;

  constructor(private dataService: DataService,
              private activeRouter: ActivatedRoute,
              private fileUpload: FileUploadService,
              private playlistService: PlaylistService,
              private router: Router,
              private editStringTag: EditStringTagsService) {
  }

  editIdPlaylist: any

  ngOnInit(): void {
    this.activeRouter.paramMap.subscribe((paramMap: ParamMap) => {
      this.openFormEdit(paramMap.get('id'));
      this.editIdPlaylist = paramMap.get('id');
    })
  }

  submitForm() {
    SwAl.fire('Please wait').then();
    SwAl.showLoading()
    if (!this.editIdPlaylist) {
      let url: string = ''
      if (this.avatar?.nativeElement.files[0]) {
          this.fileUpload.pushFileToStorage("image", this.avatar?.nativeElement.files[0]).subscribe(path => {
            url = path;
            this.saveCreate(url)
          })
      } else {
        url = 'https://thumbs.dreamstime.com/b/music-collection-line-icon-playlist-outline-logo-illustr-illustration-linear-pictogram-isolated-white-90236357.jpg'
        this.saveCreate(url)
      }
    } else {
      this.updatePlaylist();
    }

  }

  saveCreate(pathAvatar: any) {
    const playlist: Playlist = {
      avatar: pathAvatar,
      name: this.formPlaylist.value.name,
      description: this.formPlaylist.value.description,
      // @ts-ignore
      users: {id: localStorage.getItem('idUser')},
      tagsList: this.editStringTag.editStringTag(this.stringTag)
    }
    this.playlistService.saveCreate(playlist).subscribe(() => {
      SwAl.fire({
        title: 'Create New Playlist Success',
        icon: "success",
        showConfirmButton: false,
        showCloseButton: false,
        timer: 2000,
        customClass: {
          title: 'success-message',
          popup: 'popup',
          confirmButton: 'confirm-btn',
          closeButton: 'close-btn'
        }
      }).then()
      this.dataService.changeMessage("Save Success");
      return this.router.navigateByUrl('/library/playlist')
    })
  }

  openUpload(s: string) {
    $(s).trigger('click')
  }

  renderImagePath(event: any) {
    if (!this.avatar?.nativeElement.files[0].type.includes('image/')) {
      SwAl.fire({
        title: 'Incorrect Image Format',
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
    }else {
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

  openFormEdit(id: any) {
    this.playlistService.findPlaylistById(id).subscribe((data: Playlist) => {
      this.formPlaylist.patchValue(data);
      if (data.avatar) {
        this.playlistImage = data.avatar
      }
      this.stringTag = '';
      // @ts-ignore
      for (let i = 0; i < data.tagsList.length; i++) {
        // @ts-ignore
        this.stringTag += '#' + data.tagsList[i].name + ' '
      }
      this.titleContent = "Update Playlist"
    })
  }

  updatePlaylist() {
    const form: Playlist = this.formPlaylist.value;
    let url: string | undefined = '';
    if (this.avatar?.nativeElement.files[0]) {
      this.fileUpload.pushFileToStorage("image", this.avatar?.nativeElement.files[0]).subscribe(path => {
        url = path;
        this.saveUpdate(url)
      })
    } else {
      url = form.avatar;
      this.saveUpdate(url)
    }
  }

  saveUpdate(pathAvatar: any) {
    const playlist: Playlist = {
      avatar: pathAvatar,
      name: this.formPlaylist.value.name,
      description: this.formPlaylist.value.description,
      // @ts-ignore
      users: this.formPlaylist.value.users,
      tagsList: this.editStringTag.editStringTag(this.stringTag)
    }
    this.playlistService.updatePlaylist(this.editIdPlaylist, playlist).subscribe(() => {
      SwAl.fire({
        title: 'Update Playlist Success',
        icon: "success",
        showConfirmButton: false,
        showCloseButton: false,
        timer: 2000,
        customClass: {
          title: 'success-message',
          popup: 'popup',
          confirmButton: 'confirm-btn',
          closeButton: 'close-btn'
        }
      }).then()
      this.dataService.changeMessage("Save Success");
      return this.router.navigateByUrl('/library/playlist')
    })
  }
}
