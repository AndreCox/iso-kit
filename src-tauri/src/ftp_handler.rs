extern crate ftp;

use ftp::{FtpError, FtpStream};
use tauri::State;

struct FtpState(Result<FtpStream, FtpError>);

#[tauri::command]
pub async fn ftp_connect(state: State<'_, FtpState>) {
    print!("test")
}
