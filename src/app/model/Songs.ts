import {User} from "./User";
import {Singer} from "./Singer";
import {Tags} from "./Tags";

export interface Songs {
  id?:string;
  name?:string
  audio?:string;
  avatar?:string;
  users?:User;
  singerList?:Singer[];
  composer?:string;
  date?:Date;
  tagsList?:Tags[];
  views?:number;
  userLikeSong?:User[];

}
