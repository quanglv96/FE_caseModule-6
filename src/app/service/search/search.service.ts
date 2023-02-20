import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
const API_URL = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }
  resultSearch(textSearch:string){
    return this.http.get(`${API_URL}/search?search=${textSearch}`)
  }
  findAllByTag(idTag:string|any):Observable<Object[]>{
    return this.http.get<Object[]>(`${API_URL}/search/tags/${idTag}`)
  }
}
