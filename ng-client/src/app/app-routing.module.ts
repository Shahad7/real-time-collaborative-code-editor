import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { authGuard } from './auth/auth.guard';
import { DataStoreComponent } from './components/data-store/data-store.component';
import { FileContentComponent } from './components/file-content/file-content.component';

const routes: Routes = [
  // Redirect to index guarded by login
  { path: '', redirectTo: 'code-editor', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'code-editor',
    component: CodeEditorComponent,
    canActivate: [authGuard],
  },
  { path: 'sign-up', component: SignUpComponent },
  // Add more routes for other pages as needed
  { path: 'data-store/:roomID', component: DataStoreComponent },
  { path: 'data-store/:roomID/file/:fileID', component: FileContentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
