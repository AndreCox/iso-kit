extern crate ftp;

use ftp::{FtpError, FtpStream};
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use crate::FtpState;

#[tauri::command]
pub async fn ftp_connect(state: tauri::State<'_, FtpState>, address: String) -> Result<(), ()> {
    println!("Connecting to {}...", address);

    *state.0.lock().unwrap() = FtpStream::connect(&address);
    let mut ftp_stream = state.0.lock().unwrap();

    // check if the connection was successful otherwise return an error
    match ftp_stream.as_mut() {
        Ok(_) => {
            println!("Connected to {}", &address);
            Ok(())
        }
        Err(_) => {
            println!("Failed to connect to {}", &address);
            Err(())
        }
    }
}

#[tauri::command]
pub async fn ftp_auth(
    state: tauri::State<'_, FtpState>,
    username: String,
    password: String,
) -> Result<(), ()> {
    println!("Authenticating as {}...", username);

    let mut ftp_stream = state.0.lock().unwrap();

    // check if the connection was successful otherwise return an error
    match ftp_stream.as_mut().unwrap().login(&username, &password) {
        Ok(_) => {
            println!("Authenticated as {}", &username);
            Ok(())
        }
        Err(_) => {
            println!("Failed to authenticate as {}", &username);
            Err(())
        }
    }
}

#[tauri::command]
pub async fn ftp_disconnect(state: tauri::State<'_, FtpState>) -> Result<(), ()> {
    println!("Disconnecting from FTP server...");

    let mut ftp_stream = state.0.lock().unwrap();

    // disconnect from the server
    match ftp_stream.as_mut() {
        Ok(ftp_stream) => match ftp_stream.quit() {
            Ok(_) => {
                println!("Disconnected from FTP server");
                Ok(())
            }
            Err(_) => {
                println!("Failed to disconnect from FTP server");
                Err(())
            }
        },
        Err(_) => {
            println!("Failed to disconnect from FTP server");
            Err(())
        }
    }
}

#[tauri::command]
pub async fn ftp_pwd(state: tauri::State<'_, FtpState>) -> Result<String, ()> {
    println!("Getting current directory...");

    let mut ftp_stream = state.0.lock().unwrap();

    // get the current directory
    match ftp_stream.as_mut() {
        Ok(ftp_stream) => match ftp_stream.pwd() {
            Ok(pwd) => {
                println!("Current directory: {}", pwd);
                Ok(pwd)
            }
            Err(_) => {
                println!("Failed to get current directory");
                Err(())
            }
        },
        Err(_) => {
            println!("Failed to get current directory");
            Err(())
        }
    }
}

#[tauri::command]
pub async fn ftp_ls(state: tauri::State<'_, FtpState>) -> Result<Vec<String>, ()> {
    println!("Listing directory...");

    let mut ftp_stream = state.0.lock().unwrap();

    // get the current directory
    match ftp_stream.as_mut() {
        Ok(ftp_stream) => match ftp_stream.nlst(None) {
            Ok(list) => {
                println!("Directory list: {:?}", list);
                Ok(list)
            }
            Err(_) => {
                println!("Failed to list directory");
                Err(())
            }
        },
        Err(_) => {
            println!("Failed to list directory");
            Err(())
        }
    }
}
