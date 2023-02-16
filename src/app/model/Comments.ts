import {User} from "./User";
import {Songs} from "./Songs";
import {Playlist} from "./Playlist";

export interface Comments{
  id?:string;
  date?:Date;
  content?:string;
  users?:User;
  songs?:Songs;
  playlist?:Playlist

}
