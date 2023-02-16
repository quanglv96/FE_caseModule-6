import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Comments} from "../../model/Comments";
const API_URL = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) { }

  getPlaylistComments(id: number | undefined) {
    return this.http.get<Comments[]>(`${API_URL}/comment/playlist/${id}`)
  }
}
