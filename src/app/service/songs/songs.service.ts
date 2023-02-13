import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Songs} from "../../model/Songs";
const API_URL = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class SongsService {

  constructor(private http: HttpClient) { }
  findSongByUser(id:number){
    return this.http.get(`${API_URL}/songs/listSongsByUser/${id}`)
  }

  getTopSongs() {
    return this.http.get<Songs[]>(`${API_URL}/songs/listSongsTrending`)
  }

  getNewSongs() {
    return this.http.get<Songs[]>(`${API_URL}/songs/listNewSongs`)
  }
  listTop10SongsTrending(){
    return this.http.get(`${API_URL}/songs/listTop10SongsTrending`)
  }
}
