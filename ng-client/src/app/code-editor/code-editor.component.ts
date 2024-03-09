import { Component } from '@angular/core';
import { SocketService } from '../socket/socket.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css'],
})
export class CodeEditorComponent {
  constructor(private socketService: SocketService) {}
}
