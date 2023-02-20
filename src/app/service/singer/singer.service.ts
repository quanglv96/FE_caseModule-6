import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Songs} from "../../model/Songs";
import {Singer} from "../../model/Singer";
const API_URL = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class SingerService {

  constructor(private http: HttpClient) { }

  getSongs(id: number | undefined) {
    return this.http.get<Songs[]>(`${API_URL}/search/songsBySinger?idSinger=${id}`)
  }

  getSinger(id: number | undefined) {
    return this.http.get<Singer>(`${API_URL}/singers/${id}`)
  }
}
