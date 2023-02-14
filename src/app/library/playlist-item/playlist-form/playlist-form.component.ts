import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Tags} from "../../../model/Tags";
import * as $ from "jquery";
import {FileUploadService} from "../../../service/file-upload.service";
import {Playlist} from "../../../model/Playlist";
import {PlaylistService} from "../../../service/playlist/playlist.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {DataService} from "../../../service/data/data.service";

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

  constructor(private dataService:DataService, private activeRouter: ActivatedRoute, private fileUpload: FileUploadService, private playlistService: PlaylistService, private router: Router) {
  }

  editIdPlaylist: any

  ngOnInit(): void {
    this.activeRouter.paramMap.subscribe((paramMap: ParamMap) => {
      this.openFormEdit(paramMap.get('id'));
      this.editIdPlaylist = paramMap.get('id');
    })
  }

  submitForm() {
    if (!this.editIdPlaylist) {
      const form: Playlist = this.formPlaylist.value;
      let url: string = ''
      if (this.avatar?.nativeElement.files[0]) {
        if (this.avatar?.nativeElement.files[0].name.includes('mp3')) {
          return alert("k đc up file mp3")
        } else {
          this.fileUpload.pushFileToStorage("image", this.avatar?.nativeElement.files[0]).subscribe(path => {
            url = path;
            console.log('true:' + url)
            const playlist: Playlist = {
              avatar: url,
              name: form.name,
              description: form.description,
              // @ts-ignore
              users: {id: localStorage.getItem('idUser')},
              tagsList: this.editStringTag(this.stringTag)
            }
            this.playlistService.saveCreate(playlist).subscribe(() => {
              this.dataService.changeMessage("save thành công");
              return this.router.navigateByUrl('/library/playlist')
            })
          })
        }

      } else {
        url = 'https://thumbs.dreamstime.com/b/music-collection-line-icon-playlist-outline-logo-illustr-illustration-linear-pictogram-isolated-white-90236357.jpg'
        console.log('false:' + url)
        const playlist: Playlist = {
          avatar: url,
          name: form.name,
          description: form.description,
          // @ts-ignore
          users: {id: localStorage.getItem('idUser')},
          tagsList: this.editStringTag(this.stringTag)
        }
        this.playlistService.saveCreate(playlist).subscribe(() => {
          this.dataService.changeMessage("save thành công");
          return this.router.navigateByUrl('/library/playlist')
        })
      }
    } else {
      this.updatePlaylist();
    }

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
      if (list[i] != "") {
        // @ts-ignore
        tag.push({id: null, name: list[i]})
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
      if (this.avatar?.nativeElement.files[0].name.includes('mp3')) {
        return alert("k đc up file mp3")
      } else {
        this.fileUpload.pushFileToStorage("image", this.avatar?.nativeElement.files[0]).subscribe(path => {
          url = path;
          console.log('true:' + url)
          const playlist: Playlist = {
            avatar: url,
            name: form.name,
            description: form.description,
            // @ts-ignore
            users: form.users,
            tagsList: this.editStringTag(this.stringTag)
          }
          this.playlistService.updatePlaylist(this.editIdPlaylist,playlist).subscribe(() => {
            this.dataService.changeMessage("save thành công");
            return this.router.navigateByUrl('/library/playlist')
          })
        })
      }
    } else {
      url = form.avatar;
      console.log('false:' + url)
      const playlist: Playlist = {
        avatar: url,
        name: form.name,
        description: form.description,
        // @ts-ignore
        users: form.users,
        tagsList: this.editStringTag(this.stringTag)
      }
      this.playlistService.updatePlaylist(this.editIdPlaylist,playlist).subscribe(() => {
        this.dataService.changeMessage("save thành công");
        return this.router.navigateByUrl('/library/playlist')
      })
    }
  }
}
