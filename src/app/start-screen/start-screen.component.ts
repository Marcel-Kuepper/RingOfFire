import { Component, OnInit, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { firestore } from 'firebase-admin';
import { addDoc, collection, doc } from 'firebase/firestore';
import { Game } from 'src/models/game';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent implements OnInit {

  firestore: Firestore = inject(Firestore);
  
  game = new Game();
  gameId !:string | undefined;
  
  constructor( private router: Router){}

ngOnInit(): void {}

 async newGame(){
  await this.addGame()
  this.router.navigateByUrl('/game/' + this.gameId);
}

async addGame() {
  try {
    const docRef = await addDoc(this.getGameRef(), this.game.toJSON());
    this.gameId = docRef.id;
    console.log('Game ID:', this.gameId);
  } catch (error) {
    console.error('Error adding game:', error);
  }
}

getGameRef() {
  return collection(this.firestore, 'game');
}

getSingleDocRef(colId: string, docId: string) {
  return doc(collection(this.firestore, colId), docId);
}
}
