import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { EditingFieldComponent } from './components/editing-field/editing-field.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SocketService } from './socket/socket.service';
import { FolderComponent } from './components/folder/folder.component';
import { FileComponent } from './components/file/file.component';
import { ExplorerComponent } from './components/explorer/explorer.component';
import { SidebarMenuComponent } from './components/sidebar-menu/sidebar-menu.component';
import { ChatboxComponent } from './components/chatbox/chatbox.component';
import { MessageComponent } from './components/chatbox/message/message.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { DataStoreComponent } from './components/data-store/data-store.component';
import { FileContentComponent } from './components/file-content/file-content.component';
import { RoomLogComponent } from './components/room-log/room-log.component';
import { RepositoryComponent } from './components/repository/repository.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CodeEditorComponent,
    HeaderComponent,
    SidebarComponent,
    EditingFieldComponent,
    SignUpComponent,
    FolderComponent,
    FileComponent,
    ExplorerComponent,
    SidebarMenuComponent,
    ChatboxComponent,
    MessageComponent,
    UserListComponent,
<<<<<<< HEAD
    DataStoreComponent,
    FileContentComponent,
=======
    RoomLogComponent,
    RepositoryComponent,
>>>>>>> acffa182c9badb07ae6e5ccf19cd000dfa166349
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MonacoEditorModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
