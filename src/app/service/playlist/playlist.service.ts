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
    return this.http.get<Playlist[]>(`${API_URL}/playlist/top`)
  }

  saveCreate(playlist: Playlist) {
    return this.http.post<Playlist>(`${API_URL}/playlist`,playlist)
  }

  getNewPlaylist() {
    return this.http.get<Playlist[]>(`${API_URL}/playlist/new`)
  }

  getPlaylistByUser(id: number) {
    return this.http.get<Playlist[]>(`${API_URL}/playlist/findPlaylistByUser/${id}`)
  }
}
