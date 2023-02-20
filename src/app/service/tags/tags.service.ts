import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Songs} from "../../model/Songs";
import {SongsService} from "../songs/songs.service";
const API_URL = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class TagsService {

  constructor(private http: HttpClient) {}
  findSongsByTags(id : number){
    return this.http.get(`${API_URL}/tags/findSongsByTag/${id}`)
  }
}
