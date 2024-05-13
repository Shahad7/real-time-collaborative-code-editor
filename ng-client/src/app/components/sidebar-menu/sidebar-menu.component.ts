import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FileExplorerService } from 'src/app/components/explorer/file-explorer.service';
import { SidebarService } from '../sidebar/sidebar.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { OnInit } from '@angular/core';
@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.css'],
})
export class SidebarMenuComponent implements OnInit,OnDestroy {
  @ViewChild('messageCount')
  messageCount: any;
  count: number = 0;
  notificationSound = new Audio('assets/notification1.mp3');
  subscription : any;
  constructor(
    private sidebarService: SidebarService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        let current_path = this.router.url;

        if (current_path.startsWith('/code-editor')) {
          let extracts = current_path.split('/');
          let selectedOption = extracts[2] as any;
          if (selectedOption == 'chatbox') {
            this.count = 0;
          }
          this.sidebarService.announceNavigation(selectedOption);
          this.selectOption(selectedOption);
        }
      }
    });

    //updating new message count
    this.subscription =  this.sidebarService.messageCountUpdate$.subscribe((value) => {
      console.log('before if')
      if (value == 'new' && this.currentOption != 'chatbox') {
        this.count++;
        console.log('called')
        this.notificationSound.play();
      }
    });
  }
  currentOption: 'explorer' | 'chatbox' | 'view-members' | 'room-log' =
    'explorer';

  selectOption(option: 'explorer' | 'chatbox' | 'view-members' | 'room-log') {
    this.currentOption = option;
    this.sidebarService.selectOption(option);
    this.router.navigate(['code-editor', option]);
  }

  ngOnInit(): void {
    let option = this.route.snapshot.paramMap.get('option');
    if (option) this.selectOption(option as any);
    else this.selectOption('explorer');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }
}
