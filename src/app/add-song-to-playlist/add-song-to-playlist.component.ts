import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PlaylistService} from "../service/playlist/playlist.service";
import {Playlist} from "../model/Playlist";
import SwAl from "sweetalert2";
import {User} from "../model/User";
import {UserService} from "../service/user/user.service";

@Component({
  selector: 'app-add-song-to-playlist',
  templateUrl: './add-song-to-playlist.component.html',
  styleUrls: ['./add-song-to-playlist.component.css']
})
export class AddSongToPlaylistComponent implements OnInit {
  addMode = true;
  // idUser,song
  data: any
  user:User={}
  playlists?: Playlist[]
  alertSwAl=SwAl.mixin({
    toast: true,
    heightAuto:true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', SwAl.stopTimer)
      toast.addEventListener('mouseleave', SwAl.resumeTimer)
    }
  })
  @Input() newNamePlaylist: string|any;

  constructor(private dialogRef: MatDialogRef<AddSongToPlaylistComponent>,
              private userService:UserService,
              private playlistService: PlaylistService,
              @Inject(MAT_DIALOG_DATA) data: any) {
    this.data = data
  }

  ngOnInit() {
    this.playlistService.getPlaylistByUser(this.data.idUser).subscribe(
      playlist => {
        this.playlists = playlist;
      }
    )
  }

  isPlaylistContainSong(indexPlaylist: any) {
    // @ts-ignore
    return !!this.playlists[indexPlaylist].songsList?.find((element) => {
      return element.id== this.data.song.id
    })
  }

  switchTo(mode: string) {
    this.addMode = mode === 'create-new';
  }

  addSongToPlaylist(indexPlaylist: any) {
    // @ts-ignore
    this.playlists[indexPlaylist].songsList.push(this.data.song)
    // @ts-ignore
    this.isPlaylistContainSong(indexPlaylist)
    // @ts-ignore
    this.playlistService.changeSongToPlaylist(this.playlists[indexPlaylist]).subscribe(()=>{
      this.alertSwAl.fire({
        icon: 'success',
        title: 'Add Success'}).then()
    })
  }

  deleteSongInPlaylist(indexPlaylist: number) {
    // @ts-ignore
    this.playlists[indexPlaylist].songsList=this.playlists[indexPlaylist].songsList.filter(element=>element.id!=this.data.song.id)
    // @ts-ignore
    this.isPlaylistContainSong(indexPlaylist)
    // @ts-ignore
    this.playlistService.changeSongToPlaylist(this.playlists[indexPlaylist]).subscribe(()=>{
      this.alertSwAl.fire({
        icon: 'success',
        title: 'Remove Success'}).then()
    })
  }

  addSongNewPlaylist() {
    this.userService.findById(this.data.idUser).subscribe((user:User)=>{
      const playlist:Playlist={
        name:this.newNamePlaylist,
        users:user,
        songsList:[this.data.song],
        views:1000
      }
      this.playlistService.changeSongToPlaylist(playlist).subscribe(()=>{
        this.alertSwAl.fire({
          icon: 'success',
          title: 'Add Success'}).then(()=>{
            this.dialogRef.close();
        })
      })
    })
  }
}
