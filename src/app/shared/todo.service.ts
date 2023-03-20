import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  firestoreCollection: AngularFirestoreCollection;
  dateCollection: AngularFirestoreCollection;

  constructor(private firestore: AngularFirestore) {
    this.firestoreCollection = firestore.collection('todos');
    this.dateCollection = firestore.collection('today');

  }
  addTodo(title: string) {
    this.firestoreCollection.add({
      title: title,
      isDone: false,
    });
  }
  updateTodoStatus(id: string, newStatus: boolean) {
    this.firestoreCollection.doc(id).update({ isDone: newStatus });
  }
  deleteTodo(id: string) {
    this.firestoreCollection.doc(id).delete();
  }
  checkTime(time: any) {
    this.dateCollection
      .valueChanges({ idField: 'id' })
      .subscribe((item) => {

        this.compareDate(item[0]['today'], time, item[0]['id'])
      });

  }
  convertToDate(dateSting: any) {
    const [day, month, year] = dateSting.split("/");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  async deletePending() {
    this.firestoreCollection
      .valueChanges({ idField: 'id' })
      .subscribe((res) => {
        let x = res.filter((a: any) => { if (a.isDone == true) { return a } });
        for (let i = 0; i <= x.length; i++) {
          this.deleteTodo(x[i].id)
        }

      });

  }
  updateDate(currentDate: any, id: any) {
    this.dateCollection.doc(id).update({ today: currentDate });

  }


  async compareDate(dbDate: any, currentDate: any, id: any) {
    console.log("inside compareDate", dbDate, currentDate);

    if (this.convertToDate(currentDate) > this.convertToDate(dbDate)) {
      await this.deletePending();
      this.updateDate(currentDate, id);
    }
  }
}
