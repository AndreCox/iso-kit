//set up mobx store
import { makeAutoObservable, autorun, reaction } from "mobx";

class Store {
  inputText = "";
  outputText = "";
  timesUpdated = 0;

  constructor() {
    makeAutoObservable(this);
    reaction(
      () => this.inputText,
      () => {
        this.outputText = this.inputText.split("").reverse().join("");
        this.timesUpdated++;
      }
    );
    reaction(
      () => this.outputText,
      () => {
        this.inputText = this.outputText.split("").reverse().join("");
      }
    );
  }
}

export const store = new Store();
