//set up mobx store
import { makeAutoObservable, autorun, reaction } from "mobx";

type isoData = { path: string; name: string; id: number; status: string };
type isoDataList = isoData[];
class Store {
  //object path to store iso data
  isoData: isoDataList = [];

  constructor() {
    makeAutoObservable(this);
  }
}

export const store = new Store();
