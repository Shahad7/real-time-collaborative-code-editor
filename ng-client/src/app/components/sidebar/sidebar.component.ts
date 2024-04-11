import { Component } from '@angular/core';
import { FileExplorerService } from 'src/app/file-explorer.service';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  currentSidebarOption: 'explorer' | 'chatbox' | 'view-members' = 'explorer';

  constructor(
    private explorerService: FileExplorerService,
    private sidebarService: SidebarService
  ) {
    //subscribe to currentSidebarOption rxjs subject to switch b/w sidebar options
    this.sidebarService.currentSidebarOption$.subscribe((option) => {
      this.currentSidebarOption = option;
    });
  }
  alertClick(e: any) {
    if (
      e.srcElement.tagName == 'INPUT' ||
      e.srcElement.className ==
        'explorer-head-identifier create-btns-identifier' ||
      e.srcElement.className == 'explorer-head' ||
      e.srcElement.className == 'explorer-head active' ||
      e.srcElement.className == 'create-btns'
    ) {
      this.explorerService.alertClick(false);
    } else {
      this.explorerService.alertClick(true);
    }
  }
}
