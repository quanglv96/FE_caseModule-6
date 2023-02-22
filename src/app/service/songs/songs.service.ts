import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Songs} from "../../model/Songs";
import {Comments} from "../../model/Comments";
import {Observable} from "rxjs";
const API_URL = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class SongsService {

  constructor(private http: HttpClient) { }
  findSongByUser(id:number){
    return this.http.get<Songs[]>(`${API_URL}/songs/listSongsByUser/${id}`)
  }

  getTopSongs() {
    return this.http.get<Songs[]>(`${API_URL}/songs/listSongsTrending`)
  }

  getNewSongs() {
    return this.http.get<Songs[]>(`${API_URL}/songs/listNewSongs`)
  }
  listTop10SongsTrending(){
    return this.http.get<Songs[]>(`${API_URL}/songs/listTop10SongsTrending`)
  }
  listTop10SongsLikeTrending(){
    return this.http.get<Songs[]>(`${API_URL}/songs/listTop10SongsLikeTrending`)
  }
  saveCreate(song:Songs){
    return this.http.post(`${API_URL}/songs`,song)
  }
  deleteSong(idSong:number){
    return  this.http.delete(`${API_URL}/songs/${idSong}`)
  }
  findSongById(idSong:number|any){
    return this.http.get<Songs>(`${API_URL}/songs/${idSong}`)
  }
  updateSong(idSong:number|any,newSong:Songs){
    return this.http.put(`${API_URL}/songs/${idSong}`,newSong)
  }
  getCommentSong(idSong:number|any){
    return this.http.get<Comments[]>(`${API_URL}/comment/song/${idSong}`)
  }
  saveComment(comment:Comments){
    return this.http.post(`${API_URL}/comment`, comment)
  }
  getHint5Songs(idSongNow:any){
    return this.http.get<Songs[]>(`${API_URL}/songs/suggest/${idSongNow}`)
  }
  changeLikeSongOrViews(songs:Songs):Observable<any>{
    return this.http.put(`${API_URL}/songs/like`,songs)
  }

}
