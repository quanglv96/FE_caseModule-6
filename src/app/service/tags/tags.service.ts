import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Songs} from "../../model/Songs";
import {SongsService} from "../songs/songs.service";
import {Tags} from "../../model/Tags";
import {Observable} from "rxjs";
const API_URL = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class TagsService {

  constructor(private http: HttpClient) {}

  findSongsByTags(id: number){
    return this.http.get<Songs[]>(`${API_URL}/tags/findSongsByTag/${id}`)
  }
  getHint5Tag():Observable<Tags[]>{
    return this.http.get<Tags[]>(`${API_URL}/tags/hint5Tags`)
  }
}
