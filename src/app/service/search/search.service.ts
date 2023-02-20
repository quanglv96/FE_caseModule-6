import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Playlist} from "../../model/Playlist";
import {Tags} from "../../model/Tags";
const API_URL = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }
  resultSearch(textSearch:string){
    return this.http.get(`${API_URL}/search?search=${textSearch}`)
  }

  getPlaylistByTag(id: number | undefined)  {
    return this.http.get<[]>(`${API_URL}/playlist/taglist/${id}`)
  }
  getAllTag() {
    return this.http.get(`${API_URL}/tags`)
  }
}
