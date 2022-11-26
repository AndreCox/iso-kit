import {
  Button,
  IconButton,
  Input,
  Navbar,
  Progress,
  Switch,
} from "@material-tailwind/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { listen } from "@tauri-apps/api/event";
import { useState } from "react";
import { store } from "../stores/Store";
import { observable, runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import path from "path";
import { MdDelete } from "react-icons/md";
import { open, save } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { dropLoader, basename, fileLoader } from "../helpers/fileLoader";
import statusColor from "../helpers/statusColor";

const Home = observer(() => {
  const onDrop = (e) => {
    e.preventDefault();
  };

  if (typeof window !== "undefined") {
    listen("tauri://file-drop", (event) => {
      setDrag(false);
      dropLoader(event);
    });

    listen("tauri://file-drop-hover", (event) => {
      setDrag(true);
    });

    listen("tauri://file-drop-cancelled", (event) => {
      setDrag(false);
    });

    listen("progress", (event) => {
      console.log(event);
      // @ts-ignore
      setProgress(event.payload * 100);
    });
  }

  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(0);

  const [processing, setProcessing] = useState(false);
  const [offline, setOffline] = useState(false);
  const [outputDir, setOutputDir] = useState("");

  return (
    <div className="p-[0 2rem]">
      <Head>
        <title>Next Template</title>
        <meta name="description" content="Generated with next-template" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen flex flex-1 flex-col">
        <div className="h-10 z-50">
          <div className="w-full fixed top-0 px-2">
            <Navbar className="space-x-2 flex px-2 py-2">
              <Button
                className="normal-case"
                onClick={() => {
                  open({
                    multiple: true,
                    directory: false,
                    filters: [
                      {
                        extensions: ["iso"],
                        name: "ISO",
                      },
                    ],
                  }).then((result) => {
                    fileLoader(result);
                  });
                }}
              >
                Import ISOs
              </Button>
              <div className="flex justify-end flex-grow h-fit space-x-2">
                <Button
                  className="normal-case"
                  onClick={() => {
                    if (!processing) {
                      for (const iso of store.isoData) {
                        if (iso.status === "idle") {
                          setProcessing(true);
                          runInAction(() => {
                            iso.status = "processing";
                          });
                          invoke("convert2god", {
                            path: iso.path,
                            dest: outputDir != "" ? outputDir : "./",
                            offline: offline,
                          }).then((result) => {
                            runInAction(() => {
                              iso.status = "done";
                            });
                            setProcessing(false);
                          });
                        }
                      }
                    }
                  }}
                >
                  ISOs to GoD
                </Button>
                <Button className="normal-case">Extract ISOs</Button>
              </div>
            </Navbar>
          </div>
        </div>
        {/* grid that splits screen vertically into two columns */}
        <div className="flex flex-1 flex-col md:flex-row mb-2">
          {/* left column */}
          <ul
            className={
              "relative shadow-blue-500 md:w-1/2 mx-2 mb-2 border mt-7 px-2 space-y-2 rounded-xl transition-shadow duration-200 md:h-auto min-h-[35vh]" +
              (drag ? " shadow-blue-500 shadow-all-inner" : "")
            }
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 block w-full text-center  flex-col justify-center">
              <AnimatePresence>
                {store.isoData.length < 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: drag ? 1.1 : 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <p className="text-2xl">Drop ISOs here</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence initial={false}>
              {store.isoData.map((iso, i) => {
                return (
                  <motion.li
                    key={iso.id}
                    className="w-full justify-center flex shrink text-left h-fit"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{
                      type: "EaseInOut",
                      duration: 0.2,
                    }}
                    layout
                  >
                    <div
                      className={
                        "normal-case flex py-2 w-full text-base mb-2 border border-blue-100  hover:shadow-md hover:shadow-blue-50 transition-all shadow rounded-lg p-2 hover:border-blue-500"
                      }
                    >
                      <div className="flex flex-col justify-center h-full">
                        {basename(iso.path)}
                      </div>
                      <div className="flex flex-row grow justify-end space-x-2">
                        <div
                          className="flex space-x-1 flex-row justify-center p-2 whitespace-nowrap flex-nowrap font-bold border rounded-lg  h-fit"
                          style={{
                            borderColor: statusColor(iso.status),
                          }}
                        >
                          <div className="">
                            {iso.status.charAt(0).toUpperCase() +
                              iso.status.slice(1)}
                          </div>
                          <div>
                            {iso.status == "processing" && (
                              <p>{Math.round(progress) + "%"}</p>
                            )}
                          </div>
                        </div>
                        <IconButton
                          className="text-2xl"
                          onClick={() => {
                            runInAction(() => {
                              store.isoData.splice(i, 1);
                            });
                          }}
                        >
                          <MdDelete />
                        </IconButton>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          {/* right column */}
          <div className="flex flex-1 flex-col px-2 py-2 md:mt-7 md:ml-0 ml-2 mr-2 mb-2 border rounded-xl space-y-4">
            <Input
              label="Output Path"
              value={outputDir}
              onChange={(e) => {
                setOutputDir(e.target.value);
              }}
              onClick={(e) => {
                open({
                  directory: true,
                  multiple: false,
                }).then((e) => {
                  setOutputDir(e?.toString());
                });
              }}
            />
            <div className="flex flex-row space-x-4">
              <p>Offline Mode</p>
              <Switch
                onChange={(e) => {
                  setOffline(e.target.checked);
                }}
              />
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 w-full">
          <div className="w-full flex justify-start rounded-full">
            <motion.div
              className="bg-blue-500 h-2 rounded-full mx-2 mb-1"
              animate={{ width: progress + "%" }}
              transition={{ duration: 0.4, type: "easeInOut" }}
            />
          </div>
        </div>
      </main>
    </div>
  );
});

export default Home;
