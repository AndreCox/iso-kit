#![feature(duration_constants)]
#![feature(seek_stream_len)]
#![feature(fs_try_exists)]
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use ftp::{FtpError, FtpStream};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

// Mutex is used to allow the FtpStream to be shared between threads

pub struct FtpState(Mutex<Result<FtpStream, FtpError>>);

#[macro_use]
mod convert2god;
mod ftp_handler;

mod iso2god;

fn main() {
    // initialize the ftp stream with a blank address just to get our struct state
    let ftp_stream = FtpStream::connect("");

    tauri::Builder::default()
        .manage(FtpState(Mutex::new(ftp_stream)))
        .invoke_handler(tauri::generate_handler![
            convert2god::convert2god,
            ftp_handler::ftp_connect,
            ftp_handler::ftp_disconnect,
            ftp_handler::ftp_pwd,
            ftp_handler::ftp_auth,
            ftp_handler::ftp_ls,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
