import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent {
  @Input()
  sender: string = '';
  @Input()
  message: string = '';
  @Input()
  color: string = '';
  @ViewChild('username')
  username: any;
}
