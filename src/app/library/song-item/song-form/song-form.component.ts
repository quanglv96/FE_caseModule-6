import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as $ from "jquery";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Songs} from "../../../model/Songs";
import {FileUploadService} from "../../../service/file-upload.service";
import {SongsService} from "../../../service/songs/songs.service";
import {DataService} from "../../../service/data/data.service";

import SwAl from "sweetalert2";
import {EditStringTagsService} from "../../../service/edit-string-tags.service";
import {EditStringSingerService} from "../../../service/edit-string-singer.service";

@Component({
  selector: 'app-song-form',
  templateUrl: './song-form.component.html',
  styleUrls: ['./song-form.component.css']
})
export class SongFormComponent implements OnInit {
  songImage?: any = 'https://media.istockphoto.com/id/1090431366/vector/love-music-neon-sign.jpg?s=612x612&w=0&k=20&c=FE2W1fcsfPk6N5Bqlbx2Ty3VHBnUXPEFy2P-sizDRE4='
  titleContent: string = "Upload My Song";
  formSong: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    composer: new FormControl('', Validators.required),
  })
  @ViewChild('avatar') avatar?: ElementRef
  @ViewChild('audio') audio?: ElementRef
  stringSinger: any;
  stringTag: any;
  editIdSong: any
  songAudio?: any;
  songAvatar?: string;
  oldSong?: Songs;

  constructor(private activeRouter: ActivatedRoute,
              private fileUpload: FileUploadService,
              private songService: SongsService,
              private router: Router,
              private dataService: DataService,
              private editStringTag: EditStringTagsService,
              private editStringSinger:EditStringSingerService) {
  }

  ngOnInit(): void {
    this.activeRouter.paramMap.subscribe((pramMap: ParamMap) => {
      if (pramMap.get('idSong')) {
        this.titleContent = "Update My Song"
        this.openFormEdit(pramMap.get('idSong'))
        this.editIdSong = pramMap.get('idSong');
      }
    })
  }

  // @ts-ignore
  submitForm() {
    SwAl.fire('Please wait').then();
    SwAl.showLoading()

    if (!this.editIdSong) {
      const form: Songs = this.formSong.value;
      let urlAvatar: string = 'https://demo.tutorialzine.com/2015/03/html5-music-player/assets/img/default.png'
      if (this.audio?.nativeElement.files[0]) {
        if (this.audio?.nativeElement.files[0].name.includes('jpg')) {
          return SwAl.fire({
            title: 'Audio file must format .mp3',
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
        }
        if (this.avatar?.nativeElement.files[0]) {
          if (this.avatar?.nativeElement.files[0].name.includes('mp3')) {
            return SwAl.fire({
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
            this.fileUpload.pushFileToStorage("image", this.avatar?.nativeElement.files[0]).subscribe(pathAvatar => {
              urlAvatar = pathAvatar;
            })
          }
        }
        this.fileUpload.pushFileToStorage("audio", this.audio?.nativeElement.files[0]).subscribe(pathAudio => {
          const songs: Songs = {
            name: form.name,
            audio: pathAudio,
            avatar: urlAvatar,
            // @ts-ignore
            users: {id: localStorage.getItem('idUser')},
            singerList: this.editStringSinger.editStringSinger(this.stringSinger),
            composer: form.composer,
            tagsList: this.editStringTag.editStringTag(this.stringTag)
          }
          this.songService.saveCreate(songs).subscribe(() => {
            SwAl.fire({
              title: 'Upload Song Success',
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
            this.dataService.changeMessage("Save Success")
            return this.router.navigateByUrl('/library/song')
          })
        })
      } else {
        return SwAl.fire({
          title: 'You have not updated the audio file',
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
      }
    } else {
      // @ts-ignore
      this.updateSong().then();
    }
  }

  // @ts-ignore
  updateSong() {
    let urlAudio: string | undefined = "";
    let urlAvatar: string | undefined = "";
    if (this.audio?.nativeElement?.files[0]) {
      if (this.audio?.nativeElement.files[0].name.includes('jpg')) {
        return SwAl.fire({
          title: 'Audio file must format .mp3',
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
        // @ts-ignore
        this.fileUpload.pushFileToStorage("audio", this.audio?.nativeElement.files[0]).subscribe(pathAudio => {
          urlAudio = pathAudio;
          if (this.avatar?.nativeElement.files[0]) {
            if (this.avatar?.nativeElement.files[0].name.includes('mp3')) {
              return SwAl.fire({
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
              this.fileUpload.pushFileToStorage("image", this.avatar?.nativeElement.files[0]).subscribe(pathAvatar => {
                urlAvatar = pathAvatar;
                this.saveUpdateSong(urlAudio, urlAvatar)
              })
            }
          } else {
            urlAvatar = this.oldSong?.avatar;
            this.saveUpdateSong(urlAudio, urlAvatar)
          }
        })
      }
    } else {
      urlAudio = this.oldSong?.audio;
      if (this.avatar?.nativeElement.files[0]) {
        if (this.avatar?.nativeElement.files[0].name.includes('mp3')) {
          return SwAl.fire({
            title: 'Audio file must format .mp3',
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
          this.fileUpload.pushFileToStorage("image", this.avatar?.nativeElement.files[0]).subscribe(pathAvatar => {
            urlAvatar = pathAvatar;
            this.saveUpdateSong(urlAudio, urlAvatar)
          })
        }
      } else {
        urlAvatar = this.oldSong?.avatar;
        this.saveUpdateSong(urlAudio, urlAvatar)
      }
    }

  }

  saveUpdateSong(pathAudio: string | any, pathAvatar: string | any) {
    const songs: Songs = {
      name: this.formSong.value.name,
      audio: pathAudio,
      avatar: pathAvatar,
      // @ts-ignore
      users: this.oldSong?.users,
      singerList: this.editStringSinger.editStringSinger(this.stringSinger),
      composer: this.formSong.value.composer,
      tagsList: this.editStringTag.editStringTag(this.stringTag)
    }
    this.songService.updateSong(this.oldSong?.id, songs).subscribe(() => {
      SwAl.fire({
        title: 'Update Song Success',
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
      this.dataService.changeMessage("Update Success")
      return this.router.navigateByUrl('/library/song')
    })
  }


  openFormEdit(idSong: any) {
    this.songService.findSongById(idSong).subscribe((data: Songs) => {
      this.oldSong = data;
      this.formSong.patchValue(data);
      if (data.avatar) {
        this.songAvatar = data.avatar
      }
      this.stringTag = '';
      // @ts-ignore
      for (let i = 0; i < data.tagsList.length; i++) {
        // @ts-ignore
        this.stringTag += '#' + data.tagsList[i].name + ' '
      }
      this.stringSinger = '';
      // @ts-ignore
      for (let i = 0; i < data.singerList.length; i++) {
        // @ts-ignore
        this.stringSinger += data.singerList[i].name
        // @ts-ignore
        if (i != (data.singerList.length - 1)) {
          this.stringSinger += ", "
        }
      }
      this.titleContent = "Update Playlist"
    })
  }

  openUpload(s: string) {
    $(s).trigger('click')
  }

  renderImagePath(event: any) {
    const files = event.target.files;
    const reader = new FileReader()
    if (files && files[0]) {
      reader.onload = () => {
        this.songImage = reader.result
      }
      reader.readAsDataURL(files[0])
    }
  }

  renderAudioPath(event: any) {
    const files = event.target.files;
    const reader = new FileReader()
    if (files && files[0]) {
      reader.onload = () => {
        this.songAudio = reader.result
      }
      reader.readAsDataURL(files[0])
    }
  }


}
