import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthComponent} from "./auth/auth.component";
import {SearchComponent} from "./search/search.component";
import {UserInfoComponent} from "./user-info/user-info.component";
import {EditUserComponent} from "./user-info/edit-user/edit-user.component";
import {ChangePasswordComponent} from "./user-info/change-password/change-password.component";
import {LibraryComponent} from "./library/library.component";
import {SongItemComponent} from "./library/song-item/song-item.component";
import {PlaylistItemComponent} from "./library/playlist-item/playlist-item.component";
import {HomeComponent} from "./home/home.component";
import {SongFormComponent} from "./library/song-item/song-form/song-form.component";
import {PlaylistFormComponent} from "./library/playlist-item/playlist-form/playlist-form.component";
import {TrendingComponent} from "./trending/trending.component";
import {SongComponent} from "./song/song.component";
import {PlaylistComponent} from "./playlist/playlist.component";
import {CanDeactivateGuard} from "./service/can-deactivate";
import {SingerComponent} from "./singer/singer.component";

const routes: Routes = [
  {path: 'auth', component: AuthComponent},
  {path: 'search/:textSearch', component: SearchComponent},
  {path: 'tag/:id', component: SearchComponent},
  {path: 'auth', component: AuthComponent},
  {path: 'user-info', component: UserInfoComponent, children: [
      {path: 'edit', component: EditUserComponent},
      {path: 'change-password', component: ChangePasswordComponent}
  ]},
  {path: 'library', component: LibraryComponent, children: [
      {path: '', pathMatch: 'full', redirectTo: '/library/song'},
      {path: 'song', component: SongItemComponent, children: [
          {path: 'new', component: SongFormComponent},
          {path: 'edit/:idSong', component: SongFormComponent}
      ]},
      {path: 'playlist', component: PlaylistItemComponent, children: [
          {path: 'new', component: PlaylistFormComponent},
          {path: 'edit/:id', component: PlaylistFormComponent}
      ]}
  ]},
  {path: 'trending', component: TrendingComponent,pathMatch:"full"},
  {path: 'song/:id', component: SongComponent, canDeactivate: [CanDeactivateGuard], pathMatch: 'full'},
  {path: 'playlist/:id', component: PlaylistComponent, canDeactivate: [CanDeactivateGuard], pathMatch: 'full'},
  {path: 'singer/:id', component: SingerComponent, canDeactivate: [CanDeactivateGuard], pathMatch: 'full'},
  {path: '', component: HomeComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
