import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { DropdownDirective } from "./service/dropdown.directive";
import { AuthComponent } from './auth/auth.component';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SearchComponent } from './search/search.component';
import { SearchItemSongComponent } from './search/search-item-song/search-item-song.component';
import { SearchItemPlaylistComponent } from './search/search-item-playlist/search-item-playlist.component';
import { SearchItemUserComponent } from './search/search-item-user/search-item-user.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { EditUserComponent } from './user-info/edit-user/edit-user.component';
import { ChangePasswordComponent } from './user-info/change-password/change-password.component';
import { HttpClientModule } from "@angular/common/http";
import { LibraryComponent } from './library/library.component';
import { FilterPipe } from "./service/pipe/filter.pipe";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from "@angular/material/icon";
import { SongItemComponent } from './library/song-item/song-item.component';
import { PlaylistItemComponent } from './library/playlist-item/playlist-item.component';
import { HomeComponent } from "./home/home.component";
import { CarouselModule } from "@coreui/angular";
import { FooterComponent } from './footer/footer.component';
import { SongFormComponent } from './library/song-item/song-form/song-form.component';
import { PlaylistFormComponent } from './library/playlist-item/playlist-form/playlist-form.component';
import { TrendingComponent } from './trending/trending.component';
import {SwiperModule} from "swiper/angular";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DropdownDirective,
    AuthComponent,
    SearchComponent,
    SearchItemSongComponent,
    SearchItemPlaylistComponent,
    SearchItemUserComponent,
    UserInfoComponent,
    EditUserComponent,
    ChangePasswordComponent,
    LibraryComponent,
    SongItemComponent,
    PlaylistItemComponent,
    HomeComponent,
    FilterPipe,
    FooterComponent,
    SongFormComponent,
    PlaylistFormComponent,
    TrendingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatIconModule,
    CarouselModule,
    SwiperModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
