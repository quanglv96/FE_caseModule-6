import { Component } from '@angular/core';
import * as $ from "jquery";

@Component({
  selector: 'app-song-form',
  templateUrl: './song-form.component.html',
  styleUrls: ['./song-form.component.css']
})
export class SongFormComponent {
  songImage?: any='https://media.istockphoto.com/id/1090431366/vector/love-music-neon-sign.jpg?s=612x612&w=0&k=20&c=FE2W1fcsfPk6N5Bqlbx2Ty3VHBnUXPEFy2P-sizDRE4='

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
}
