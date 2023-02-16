import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Playlist} from "../../model/Playlist";

const API_URL = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  constructor(private http: HttpClient) {
  }

  getTopPlaylist() {
    return this.http.get<Playlist[]>(`${API_URL}/playlist/listTop10ViewsPlaylistTrending`)
  }

  saveCreate(playlist: Playlist) {
    return this.http.post<Playlist>(`${API_URL}/playlist`,playlist)
  }

  getPlaylistByUser(id: number) {
    return this.http.get<Playlist[]>(`${API_URL}/playlist/findPlaylistByUser/${id}`)
  }
  deletePlaylist(idPlaylist:number){
    return this.http.delete<Playlist>(`${API_URL}/playlist/${idPlaylist}`)
  }
  findPlaylistById(idPlaylist:number){
    return this.http.get<Playlist>(`${API_URL}/playlist/${idPlaylist}`)
  }
  updatePlaylist(idPlaylist:number, playlist:Playlist){
    return this.http.put<Playlist>(`${API_URL}/playlist/${idPlaylist}`,playlist)
  }

  getTopLikePlaylist() {
    return this.http.get<Playlist[]>(`${API_URL}/playlist/topLikePlaylist`)
  }
}
