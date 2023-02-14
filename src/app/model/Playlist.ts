import {User} from "./User";
import {Singer} from "./Singer";
import {Tags} from "./Tags";
import {Songs} from "./Songs";

export interface Playlist{
  id?:string;
  name?:string
  description?:string;
  avatar?:string;
  dateCreate?:Date;
  lastUpdate?:Date;
  users?:User;
  songsList?:Songs[]
  tagsList?:Tags[];
  views?:number;
  userLikesPlaylist?:User[];
}
