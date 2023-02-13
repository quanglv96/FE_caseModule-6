import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
const API_URL = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class SongsService {

  constructor(private http: HttpClient) { }
  findSongByUser(id:number){
    return this.http.get(`${API_URL}/songs/listSongsByUser/${id}`)
  }
  listNewSongsByDate(){
    return this.http.get(`${API_URL}/songs/listNewSongs`)
  }
}
