import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as $ from "jquery";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Tags} from "../../../model/Tags";
import {Songs} from "../../../model/Songs";
import {FileUploadService} from "../../../service/file-upload.service";
import {User} from "../../../model/User";
import {Singer} from "../../../model/Singer";
import {SongsService} from "../../../service/songs/songs.service";
import {DataService} from "../../../service/data/data.service";

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

  constructor(private activeRouter: ActivatedRoute,
              private fileUpload: FileUploadService,
              private songService: SongsService,
              private router:Router,
              private dataService:DataService) {
  }

  ngOnInit(): void {
    this.activeRouter.paramMap.subscribe((pramMap: ParamMap) => {
      if(pramMap.get('idSong')){
        this.titleContent = "Update My Song"
        this.openFormEdit(pramMap.get('idSong'))
        this.editIdSong = pramMap.get('idSong');
      }
    })
  }

  submitForm() {
    if (!this.editIdSong) {
      const form: Songs = this.formSong.value;
      let urlAvatar: string = 'https://demo.tutorialzine.com/2015/03/html5-music-player/assets/img/default.png'
      if (this.audio?.nativeElement.files[0]) {
        if (this.audio?.nativeElement.files[0].name.includes('jpg')) {
          return alert("chỗ up file mp3 không up ảnh")
        }
        if (this.avatar?.nativeElement.files[0]) {
          if (this.avatar?.nativeElement.files[0].name.includes('mp3')) {
            return alert("chỗ up ảnh không up mp3")
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
            singerList: this.editStringSinger(this.stringSinger),
            composer: form.composer,
            tagsList: this.editStringTag(this.stringTag)
          }
          this.songService.saveCreate(songs).subscribe(() => {
            alert(" tạo thành công");
            this.dataService.changeMessage("add song thành công")
            return this.router.navigateByUrl('/library/song')
          })
        })
      }else {
        alert("tạo bài hát mới phải có file mp3. vui lòng cập nhập")
      }
    } else {
      this.updateSong();
    }
  }

  updateSong() {

  }

  openFormEdit(idSong: any) {

  }

  editStringSinger(stringSinger: string): Singer[] {
    let list = stringSinger.split(",")
    let singer: Singer[] = []
    for (let i = 0; i < list.length; i++) {
      let listIndex = list[i].split(" ")
      list[i] = "";
      for (let j = 0; j < listIndex.length; j++) {
        list[i] += listIndex[j].charAt(0).toUpperCase() + listIndex[j].slice(1)+" ";
      }
      // @ts-ignore
      singer.push({id: null, name: list[i]})
    }
    console.log(singer)
    return singer;
  }

  editStringTag(stringTag: string): Tags[] {
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
