import Input from "../components/Input";
import { store } from "../stores/Store";
import { observer } from "mobx-react-lite";
import Link from "next/link";

const MobX = observer(() => {
  return (
    <div className="text-center p-4 pt-24">
      <Link href="/">
        <a className="text-blue-500 under text-xl absolute top-0 left-0 pl-4 pt-2 underline decoration-transparent hover:decoration-blue-500 transition-colors">
          Back to home
        </a>
      </Link>
      <h1 className="font-bold text-4xl">MobX State Management Demo</h1>
      <div className="pt-4 flex flex-1 flex-col sm:flex-row justify-center sm:space-x-8 space-y-8 sm:space-y-0">
        <div className="flex flex-col">
          <p className="text-xl">Forward</p>
          <Input
            value={store.inputText}
            onChange={(e) => {
              store.inputText = e.target.value;
            }}
          />
        </div>
        <div className="flex flex-col">
          <p className="text-xl">Reverse</p>
          <Input
            value={store.outputText}
            onChange={(e) => {
              store.outputText = e.target.value;
            }}
          />
        </div>
      </div>
      <div className="pt-8 text-lg font-semibold flex justify-center">
        You have changed the store
        <p className="text-blue-500 whitespace-nowrap px-1">
          {store.timesUpdated}
        </p>
        times.
      </div>
      <div className=" pt-16 flex w-full justify-center ">
        <p className="text-xl sm:w-[35rem] text-left sm:text-center ">
          This is a simple demo of MobX State Management. Each input field is
          stored in a mobx store. When you change the input, the store is
          updated and the output field is updated. At the same time we run a
          reaction to reverse the input. We can also keep track of how many
          times the store has been updated.
        </p>
      </div>
    </div>
  );
});

export default MobX;
