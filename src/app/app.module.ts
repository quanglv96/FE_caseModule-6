import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {DropdownDirective} from "./service/dropdown.directive";
import {AuthComponent} from './auth/auth.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {SearchComponent} from './search/search.component';
import {SearchItemSongComponent} from './search/search-item-song/search-item-song.component';
import {SearchItemPlaylistComponent} from './search/search-item-playlist/search-item-playlist.component';
import {SearchItemUserComponent} from './search/search-item-user/search-item-user.component';
import {UserInfoComponent} from './user-info/user-info.component';
import {EditUserComponent} from './user-info/edit-user/edit-user.component';
import {ChangePasswordComponent} from './user-info/change-password/change-password.component';
import {HttpClientModule} from "@angular/common/http";
import {LibraryComponent} from './library/library.component';
import {FilterPipe} from "./service/pipe/filter.pipe";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatIconModule} from "@angular/material/icon";
import {SongItemComponent} from './library/song-item/song-item.component';
import {PlaylistItemComponent} from './library/playlist-item/playlist-item.component';
import {HomeComponent} from "./home/home.component";
import {FooterComponent} from './footer/footer.component';
import {SongFormComponent} from './library/song-item/song-form/song-form.component';
import {PlaylistFormComponent} from './library/playlist-item/playlist-form/playlist-form.component';
import {TrendingComponent} from './trending/trending.component';
import {CarouselModule} from "ngx-owl-carousel-o";
import {DiscoveryItemComponent} from "./trending/discovery-item/discovery-item.component";
import {environment} from '../environments/environment';
import {ScreenTrackingService, UserTrackingService} from '@angular/fire/analytics';
import {FileUploadService} from "./service/file-upload.service";
import {AngularFireStorageModule} from "@angular/fire/compat/storage";
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFireDatabaseModule} from "@angular/fire/compat/database";
import {SongComponent} from './song/song.component';
import {PlaylistComponent} from './playlist/playlist.component';
import {NgWaveformModule} from "ng-waveform";
import {NgxWavesurferModule, NgxWavesurferService} from "ngx-wavesurfer";
import {CanDeactivateGuard} from "./service/can-deactivate";
import {MomentModule} from "ngx-moment";
import {MatDialogModule} from "@angular/material/dialog";
import { AddSongToPlaylistComponent } from './add-song-to-playlist/add-song-to-playlist.component';
import {MatButtonModule} from "@angular/material/button";
import {ToStringSinger} from "./service/pipe/toStringSinger";
import { SingerComponent } from './singer/singer.component';

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
    ToStringSinger,
    FooterComponent,
    SongFormComponent,
    PlaylistFormComponent,
    TrendingComponent,
    DiscoveryItemComponent,
    SongComponent,
    PlaylistComponent,
    AddSongToPlaylistComponent,
    SingerComponent,
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
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(environment.firebase),
    NgWaveformModule,
    NgxWavesurferModule,
    MomentModule.forRoot({
      relativeTimeThresholdOptions: {
        'm': 59
      }
    }),
    MatDialogModule,
    MatButtonModule
  ],
  providers: [
    ScreenTrackingService, UserTrackingService, FileUploadService, NgxWavesurferService, CanDeactivateGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
