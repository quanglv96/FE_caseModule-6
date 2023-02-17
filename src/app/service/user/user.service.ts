import {EventEmitter, Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable, Subject} from "rxjs";
import {User} from "../../model/User";

const API_URL = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userChange = new EventEmitter<User>()

  constructor(private http: HttpClient) {
  }

  login(user?: User): Observable<any> {

    // @ts-ignore
    return this.http.post(`${API_URL}/users/login`, user)
  }

  register(user?: User): Observable<any> {
    // @ts-ignore
    return this.http.post(`${API_URL}/users`, user);
  }


  updateUser(id: number|any ,user: User): Observable<any> {
    return this.http.put(`${API_URL}/users/${id}`, user);
  }

  getUser(id: number,): Observable<User> {
    return this.http.get(`${API_URL}/users/${id}`)
  }

  findById(id: string | null): Observable<User> {
    return this.http.get(`${API_URL}/users/${id}`)
  }

  getUsername() {
    return this.http.get<string[]>(`${API_URL}/users/usernames`)
  }

  updatePass(id: number, password: String): Observable<User> {
    // @ts-ignore
    return this.http.put(`${API_URL}/users/changePass/${id}?password=${password}`)
  }

  countByUser(id: string | undefined){
    return this.http.get<[]>(`${API_URL}/users/countByUser/${id}`)
  }
}
