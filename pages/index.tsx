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
import Spinner from "../components/Spinner";
import { ftpStore } from "../stores/FtpStore";

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
  const [ftpConnecting, setFtpConnecting] = useState(false);
  const [ftpConnected, setFtpConnected] = useState(false);
  const [ftpError, setFtpError] = useState(false);
  const [ftpStatus, setFtpStatus] = useState("Connect to FTP");

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
              <AnimatePresence mode="popLayout">
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
            <AnimatePresence initial={false} mode="popLayout">
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
            <Input label="FTP Address" />
            <Button
              disabled={ftpConnecting}
              className={
                ftpConnected
                  ? "bg-green-500"
                  : ftpError
                  ? "bg-red-500"
                  : "bg-blue-500" + " transition-all duration-200"
              }
              onClick={() => {
                setFtpError(false);
                if (!ftpConnecting) {
                  if (!ftpConnected) {
                    setFtpConnecting(true);
                    invoke("ftp_connect", {
                      address: "ftp.gnu.org:21",
                    })
                      .then((result) => {
                        console.log("We connected to the FTP server!");
                        setFtpConnecting(false);
                        setFtpStatus("Connected (Disconnect)");
                        setFtpConnected(true);
                        invoke("ftp_auth", {
                          username: "anonymous",
                          password: "anonymous",
                        })
                          .then((result) => {
                            console.log("We authenticated to the FTP server!");
                            invoke("ftp_ls").then((result: string[]) => {
                              ftpStore.fileList = result;
                              console.log(result);
                            });
                            invoke("ftp_pwd").then((result: string) => {
                              ftpStore.currentPath = result;
                            });
                          })
                          .catch((e) => {
                            console.log(
                              "We failed to authenticate to the FTP server!"
                            );
                          });
                      })
                      .catch((e) => {
                        console.log(
                          "There was an error connecting to the FTP server"
                        );
                        setFtpConnecting(false);
                        setFtpStatus("Error Connecting (Connect)");
                        setFtpConnected(false);
                        setFtpError(true);
                      });
                  } else {
                    invoke("ftp_disconnect")
                      .then((result) => {
                        console.log("We disconnected from the FTP server!");
                        setFtpStatus("Disconnected (Connect)");
                        setFtpConnected(false);
                      })
                      .catch((e) => {
                        console.log(
                          "There was an error disconnecting from the FTP server"
                        );
                        setFtpStatus("Error Disconnecting (Connect)");
                        setFtpConnected(false);
                        setFtpError(true);
                      });
                  }
                }
              }}
            >
              <div className="flex flex-row justify-evenly space-x-8 ">
                <LayoutGroup>
                  <motion.div
                    className="flex flex-col justify-center"
                    layout="position"
                    transition={{
                      type: "easeInOut",
                      duration: 0.25,
                    }}
                  >
                    <p>{ftpStatus}</p>
                  </motion.div>

                  <AnimatePresence initial={false} mode="popLayout">
                    {ftpConnecting && (
                      <motion.div
                        animate={{
                          height: "2rem",
                          width: "2rem",
                          scale: 1,
                        }}
                        initial={{ height: 0, width: 0, scale: 0 }}
                        exit={{ height: 0, width: 0, scale: 0 }}
                        transition={{ duration: 0.25, type: "easeInOut" }}
                        className="flex flex-col justify-center"
                        layout
                      >
                        <Spinner />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </LayoutGroup>
              </div>
            </Button>
            <Button
              onClick={() => {
                invoke("ftp_pwd")
                  .then((result) => {
                    console.log(result);
                  })
                  .catch((e) => {
                    console.log(
                      "There was an error getting the FTP server's current directory"
                    );
                  });
                invoke("ftp_ls").then((result) => {
                  console.log(result);
                });
              }}
            >
              FTP PWD
            </Button>
            <AnimatePresence>
              {ftpConnected && (
                <motion.div
                  className="border rounded-lg p-2 flex flex-col space-y-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, type: "easeInOut" }}
                >
                  <h4 className="text-center">Select Ftp Transfer Location</h4>
                  <div className="border rounded-md p-1 py-0">
                    {ftpStore.currentPath}
                  </div>
                  {ftpStore.fileList.length > 0 && (
                    <div className="border rounded-md p-0">
                      <ul className="flex flex-col space-y-1">
                        {ftpStore.fileList.map((file, i) => {
                          return (
                            <li
                              key={i}
                              className="flex flex-row justify-between"
                            >
                              <Button
                                variant="text"
                                className="w-full text-start px-1 py-1"
                              >
                                <p className="font-normal text-base normal-case  text-black">
                                  {file}
                                </p>
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
