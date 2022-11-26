import { runInAction } from "mobx";
import path from "path";
import { store } from "../stores/Store";

const basename = function (str) {
  return str.split("\\").pop().split("/").pop();
};

const dropLoader = (event) => {
  for (let i = 0; i < event.payload.length; i++) {
    runInAction(() => {
      if (
        store.isoData.filter((file) => file.path === event.payload[i])
          .length === 0
      ) {
        if (path.extname(event.payload[i]) === ".iso") {
          store.isoData.push({
            path: event.payload[i],
            name: basename(event.payload[i]),
            id: store.isoData.length,
            status: "idle",
          });
        }
      }
    });
  }
};

const fileLoader = (result: string | string[]) => {
  if (result) {
    runInAction(() => {
      // @ts-ignore
      for (let i = 0; i < result.length; i++) {
        // check that the file does not already exist in the store
        if (
          store.isoData.filter((file) => file.path === result[i]).length === 0
        )
          if (path.extname(result[i]) === ".iso") {
            //for (let j = 0; j < 30; j++) {
            store.isoData.push({
              path: result[i],
              name: basename(result[i]),
              id: store.isoData.length,
              status: "idle",
            });
            // }
          } else {
            // send an error event
          }
      }
    });
  }
};

export { dropLoader, basename, fileLoader };
