import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { authGuard } from './auth/auth.guard';
import { RepositoryComponent } from './components/repository/repository.component';

const routes: Routes = [
  { path: '', redirectTo: 'code-editor', pathMatch: 'full' }, // Redirect to index guarded by login
  { path: 'login', component: LoginComponent },
  {
    path: 'code-editor',
    component: CodeEditorComponent,
    canActivate: [authGuard],
  },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'repository', component: RepositoryComponent },
  // Add more routes for other pages as needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
