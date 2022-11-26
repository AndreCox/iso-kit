#![feature(duration_constants)]
#![feature(seek_stream_len)]
#![feature(fs_try_exists)]
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use ftp::{FtpError, FtpStream};

#[macro_use]
mod convert2god;
mod ftp_handler;

mod iso2god;

struct FtpState(Result<FtpStream, FtpError>);

fn main() {
    // initialize the ftp stream with a blank address just to get our struct state
    let mut ftp_stream = FtpStream::connect("");

    tauri::Builder::default()
        .manage(FtpState(ftp_stream))
        .invoke_handler(tauri::generate_handler![
            convert2god::convert2god,
            my_command,
            ftp_handler::ftp_connect
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn my_command() {
    println!("Hello from Rust!");
}
