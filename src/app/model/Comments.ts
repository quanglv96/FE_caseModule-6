import {User} from "./User";

export interface Comments{
  id?:string;
  date?:Date;
  content?:string;
  user?:User;

}
