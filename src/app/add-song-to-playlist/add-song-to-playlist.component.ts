import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PlaylistService} from "../service/playlist/playlist.service";
import {data} from "jquery";
import {Playlist} from "../model/Playlist";

@Component({
  selector: 'app-add-song-to-playlist',
  templateUrl: './add-song-to-playlist.component.html',
  styleUrls: ['./add-song-to-playlist.component.css']
})
export class AddSongToPlaylistComponent implements OnInit {
  addMode = true;
  data: any
  playlists?: Playlist[]

  constructor(private dialogRef: MatDialogRef<AddSongToPlaylistComponent>,
              private playlistService: PlaylistService,
              @Inject(MAT_DIALOG_DATA) data: any) {
    this.data = data
  }

  ngOnInit() {
    this.playlistService.getPlaylistByUser(this.data.userId).subscribe(
      data => {
        this.playlists = data;
        // @ts-ignore
      }
    )
  }

  isPlaylistContainSong(p: Playlist) {
    return !!p.songsList?.find((id) => {return id == this.data.songId})
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close('abc');
  }

  switchTo(mode: string) {
    this.addMode = mode === 'create-new';
  }
}
