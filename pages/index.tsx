import { Button, Navbar } from "@material-tailwind/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { listen } from "@tauri-apps/api/event";
import { useState } from "react";

export default function Home() {
  const onDrop = (e) => {
    e.preventDefault();
    console.log("File dropped");
  };

  listen("tauri://file-drop", (event) => {
    console.log(event);
  });

  const [drag, setDrag] = useState(false);

  return (
    <div className="p-[0 2rem]">
      <Head>
        <title>Next Template</title>
        <meta name="description" content="Generated with next-template" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen flex flex-1 flex-col text-4xl">
        <div className="h-14">
          <div className="w-full fixed top-0 px-2">
            <Navbar className="space-x-2 flex px-2 py-2">
              <Button className="">Import ISOs</Button>
              <div className="flex justify-end flex-grow h-fit space-x-2">
                <Button>ISOs to GoD</Button>
                <Button>Extract ISOs</Button>
              </div>
            </Navbar>
          </div>
        </div>
        {/* grid that splits screen vertically into two columns */}
        <div className="flex flex-1 flex-col md:flex-row ">
          {/* left column */}
          <div
            className={
              "flex shadow-blue-500 flex-1 mx-2 mb-2 pt-2 flex-col border-r mt-3 px-2 space-y-2  rounded-lg transition-shadow duration-500 " +
              (drag ? " shadow-blue-500 shadow-all-inner" : "")
            }
            onDrop={(e) => {
              setDrag(false);
              e.preventDefault();
            }}
            onDragOver={(e) => {
              setDrag(true);
              e.preventDefault();
            }}
            onDragLeave={(e) => {
              setDrag(false);
              e.preventDefault();
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              Drop ISOs here
            </div>
            <Button variant="text" className="flex flex-col">
              Disk1
            </Button>
            <Button variant="text" className="flex flex-col">
              Disk1
            </Button>
            <Button variant="text" className="flex flex-col">
              Disk1
            </Button>{" "}
          </div>
          {/* right column */}
          <div className="flex flex-1 flex-col px-2 mt-2">test</div>
        </div>
      </main>
    </div>
  );
}
