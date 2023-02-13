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

  login(username: string, password: string): Observable<any> {

    // @ts-ignore
    return this.http.post(`${API_URL}/users/login?username=${username}&pass=${password}`)
  }

  register(user?: User): Observable<any> {
    // @ts-ignore
    return this.http.post(`${API_URL}/users`, user);
  }


  updateUser(id: number ,user: User): Observable<any> {
    return this.http.put(`${API_URL}/users/${id}`, user);
  }

  getUser(id: number,): Observable<User> {
    return this.http.get(`${API_URL}/users/${id}`)
  }

  findById(id: number): Observable<User> {
    return this.http.get(`${API_URL}/users/${id}`)
  }

  getUsername() {
    return this.http.get<string[]>(`${API_URL}/users/usernames`)
  }

  updatePass(id: number, password: String): Observable<User> {
    // @ts-ignore
    return this.http.put(`${API_URL}/users/changepass/${id}?password=${password}`)
  }
}
