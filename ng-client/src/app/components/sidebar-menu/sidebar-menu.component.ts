import { Component } from '@angular/core';
import { FileExplorerService } from 'src/app/file-explorer.service';
import { SidebarService } from '../sidebar/sidebar.service';
@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.css'],
})
export class SidebarMenuComponent {
  constructor(private sidebarService: SidebarService) {}
  currentOption: 'explorer' | 'chatbox' | 'view-members' = 'explorer';

  selectOption(option: 'explorer' | 'chatbox' | 'view-members') {
    this.currentOption = option;
    this.sidebarService.selectOption(option);
  }
}
