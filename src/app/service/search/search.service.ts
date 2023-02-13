import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
const API_URL = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }
  resultSearch(textSearch:string){
    return this.http.get(`${API_URL}/search?search=${textSearch}`)
  }
}
