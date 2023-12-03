import { Component } from '@angular/core';
import { Injectable, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Firestore, collectionData, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, limit, orderBy, } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { getDoc, onSnapshot } from "firebase/firestore";
import { DialogEditPlayerComponent } from '../dialog-edit-player/dialog-edit-player.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  currentCard: any;
  pickCardAnimation = false;
  game: Game;
  gameOver = false;
  gameId: string;

  game$: any;
  game2: any;


  firestore: Firestore = inject(Firestore);

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {
    this.game$ = collectionData(collection(this.firestore, 'game'));
    this.game2 = this.game$.subscribe( (list: any[]) => {
      list.forEach( (element) => {
        if (element.id == this.gameId){
        this.game = element}
      })
    } )

  }


  async ngOnInit(): Promise<void> {
    this.newGame();
    this.route.params.subscribe(async (params) => {
      this.gameId = params['id'];
      await this.loadGameFromDatabase(this.gameId);
      this.game.id = this.gameId;
    });

  }

  async loadGameFromDatabase(gameId: string) {
    const gameRef = this.getSingleDocRef('game', gameId);
    try {
      const gameDoc = await getDoc(gameRef);
      if (gameDoc.exists()) {
        this.game = gameDoc.data() as Game;
        console.log('Loaded game from database:', this.game);
      } else {
        console.error('Game not found in the database');
      }
    } catch (error) {
      console.error('Error loading game from the database:', error);
    }
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  getGameRef() {
    return collection(this.firestore, 'game');
  }

  async addGame(game: {}) {
    await addDoc(this.getGameRef(), game)
      .catch((error) => {
        console.error(error);
      })
      .then((docRef) => {
        console.log('document written ID:', docRef?.id);
      });
  }

  getCleanJSON(game: Game): {} {
    return {
      id: this.game.id,
      players: this.game.players,
      player_images: this.game.player_images,
      stack: this.game.stack,
      pickCardAnimation: this.game.pickCardAnimation,
      playedCards: this.game.playedCards,
      currentPlayer: this.game.currentPlayer,
      currentCard: this.game.currentCard,
    };
  }

  async updateGame() {
    if (this.game.id) {
      let docRef = this.getSingleDocRef('game', this.game.id);
      await updateDoc(docRef, this.getCleanJSON(this.game)).catch((err) => {
        console.log(err);
      });
    }
  }

  ngOnDestroy() {
    this.game2.unsubscribe();
  }

  newGame() {
    this.game = new Game();
  }

  takeCard() {
    if (this.game.players.length >= 2){
      const poppedCard = this.game.stack.pop();
    if (this.game.stack.length == 0) {
      this.gameOver = true;
    } else if (!this.game.pickCardAnimation) {
      if (poppedCard !== undefined) {
        this.game.currentCard = poppedCard;
        console.log(this.game.currentCard);
        this.game.pickCardAnimation = true;
        this.updateGame();
        setTimeout(() => {
          this.game.currentPlayer++;
          this.game.currentPlayer =
            this.game.currentPlayer % this.game.players.length;
          this.game.playedCards.push(this.game.currentCard);
          this.game.pickCardAnimation = false;
          this.updateGame();
        }, 2000);
      } else {
        console.error('The stack is empty');
      }
    }
    } else {
      this.openDialog();
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);
    dialogRef.afterClosed().subscribe((name: string) => {
      if (name.length > 0) {
        this.game.players.push(name);
        this.game.player_images.push('player0.png');
        this.updateGame();
      }
    });
  }

  editPlayer(playerId: number) {
    const dialogRef = this.dialog.open(DialogEditPlayerComponent);
    dialogRef.afterClosed().subscribe((change: string) => {
      if (change) {
        if (change == 'DELETE') {
          this.game.player_images.splice(playerId, 1);
          this.game.players.splice(playerId, 1);
        } else {
          this.game.player_images[playerId] = change;
        }
        this.updateGame();
      }
    });
  }

}
