import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-player',
  templateUrl: './dialog-edit-player.component.html',
  styleUrls: ['./dialog-edit-player.component.scss']
})
export class DialogEditPlayerComponent {

  profilePicture=['player0.png', 'player1.png', 'player2.png', 'player3.png'];

  constructor(public dialogRef : MatDialogRef < DialogEditPlayerComponent> ){}
}
