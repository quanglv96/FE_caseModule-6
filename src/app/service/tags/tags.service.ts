import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Tags} from "../../model/Tags";
import {Observable} from "rxjs";
const API_URL = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class TagsService {

  constructor(private http: HttpClient) { }
  getHint5Tag():Observable<Tags[]>{
    return this.http.get<Tags[]>(`${API_URL}/tags/hint5Tags`)
  }

}
