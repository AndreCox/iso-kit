import { makeAutoObservable, autorun, reaction } from "mobx";

class FtpStore {
  currentPath: string = "/";
  fileList: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }
}

export const ftpStore = new FtpStore();
