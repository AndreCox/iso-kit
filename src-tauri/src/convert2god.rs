use std::io::{BufReader, BufWriter, Read, Seek, Write};

use crate::iso2god::{god, iso, unity, xex};
use anyhow::{self, Ok};
use anyhow::{bail, Context, Error};
use num::integer::div_ceil;
use std::fs::File;
use std::path::{Path, PathBuf};
use std::{any, fs};
use tauri::Window;

// struct tauriString that allows for the conversion of anyhow errors to strings

#[tauri::command]
pub async fn convert2god(
    window: Window,
    path: String,
    dest: String,
    offline: bool,
) -> Result<(), String> {
    // call function

    let result = path2god(window, path, dest, offline);
    // convert result to string
    let result = result.await.map_err(|e| e.to_string());

    // return result
    result
}

async fn path2god(window: Window, path: String, dest: String, offline: bool) -> Result<(), Error> {
    println!("Starting to convert {} to GoD", path);

    let path = Path::new(&path);
    let dest = Path::new(&dest);
    // return any error as a string

    let source_iso_file =
        open_file_for_buffered_reading(&path).context("error opening source ISO file")?;

    let source_iso_file_meta =
        fs::metadata(&path).context("error reading source ISO file metadata")?;

    let mut source_iso = iso::IsoReader::read(BufReader::new(source_iso_file))
        .context("error reading source ISO")?;

    let mut default_xex = source_iso
        .get_entry(&"\\default.xex".into())
        .context("error reading source ISO")?
        .context("default.xex file not found")?;

    let default_xex_header =
        xex::XexHeader::read(&mut default_xex).context("error reading default.xex")?;

    let exe_info = default_xex_header
        .fields
        .execution_info
        .context("no execution info in default.xex header")?;

    // TODO: add an option to turn off online scanning
    let unity_title_info = if offline {
        None
    } else {
        println!(
            "querying XboxUnity for title ID {}",
            hex::encode_upper(exe_info.title_id)
        );
        println!("We got here");
        let client = unity::Client::new().context("error creating XboxUnity client")?;
        println!("We got here");

        client
            .find_xbox_360_title_id(&exe_info.title_id)
            .await
            .context("error querying XboxUnity; try --offline flag")?
    };

    if let Some(unity_title_info) = &unity_title_info {
        println!("\n{}\n", unity_title_info);

        // TODO: dry run option
        if false {
            return Ok(());
        }
    } else {
        // TODO: dry run option
        if false {
            bail!("no XboxUnity title info available");
        } else {
            println!("no XboxUnity title info available");
        }
    }

    // TODO: cropping

    let iso_file_size = source_iso_file_meta.len();
    let root_offset = source_iso.volume_descriptor.root_offset;

    let block_count = div_ceil(iso_file_size - root_offset, god::BLOCK_SIZE as u64);
    let part_count = div_ceil(block_count, god::BLOCKS_PER_PART);

    // the original code does not seem to support other types
    let content_type = god::ContentType::GamesOnDemand;

    let file_layout = god::FileLayout::new(&dest, &exe_info, content_type);

    println!("clearing data directory");

    ensure_empty_dir(&file_layout.data_dir_path()).context("error clearing data directory")?;

    let mut source_iso = source_iso.get_root().context("error reading source iso")?;

    println!("writing part files");

    for part_index in 0..part_count {
        window
            .emit("progress", part_index as f64 / part_count as f64)
            .unwrap();
        println!("writing part {:2} of {:2}", part_index, part_count);

        let part_file = file_layout.part_file_path(part_index);

        let mut part_file =
            open_file_for_buffered_writing(&part_file).context("error creating part file")?;

        god::write_part(&mut source_iso, &mut part_file).context("error writing part file")?;
    }

    println!("calculating MHT hash chain");

    let mut mht =
        read_part_mht(&file_layout, part_count - 1).context("error reading part file MHT")?;

    for prev_part_index in (0..part_count - 1).rev() {
        let mut prev_mht =
            read_part_mht(&file_layout, prev_part_index).context("error reading part file MHT")?;

        prev_mht.add_hash(&mht.digest());

        write_part_mht(&file_layout, prev_part_index, &prev_mht)
            .context("error writing part file MHT")?;

        mht = prev_mht;
    }

    let last_part_size = fs::metadata(file_layout.part_file_path(part_count - 1))
        .map(|m| m.len())
        .context("error reading part file")?;

    println!("writing con header");

    let mut con_header = god::ConHeaderBuilder::new()
        .with_execution_info(&exe_info)
        .with_block_counts(block_count as u32, 0)
        .with_data_parts_info(
            part_count as u32,
            last_part_size + (part_count - 1) * (god::BLOCK_SIZE as u64) * 0xa290,
        )
        .with_content_type(god::ContentType::GamesOnDemand)
        .with_mht_hash(&mht.digest());

    if let Some(unity_title_info) = &unity_title_info {
        con_header = con_header.with_game_title(&unity_title_info.name);
    }

    //else if let Some(game_title) = args.game_title {
    //    con_header = con_header.with_game_title(&game_title);
    //}

    let con_header = con_header.finalize();

    let mut con_header_file = open_file_for_buffered_writing(&file_layout.con_header_file_path())
        .context("cannot open con header file")?;

    con_header_file
        .write_all(&con_header)
        .context("error writing con header file")?;

    println!("done");

    Ok(())
}

fn ensure_empty_dir(path: &Path) -> Result<(), Error> {
    if fs::try_exists(path)? {
        fs::remove_dir_all(path)?;
    };
    fs::create_dir_all(path)?;
    Ok(())
}

fn read_part_mht(file_layout: &god::FileLayout, part_index: u64) -> Result<god::HashList, Error> {
    let part_file = file_layout.part_file_path(part_index);
    let mut part_file = File::options().read(true).open(part_file)?;
    god::HashList::read(&mut part_file)
}

fn write_part_mht(
    file_layout: &god::FileLayout,
    part_index: u64,
    mht: &god::HashList,
) -> Result<(), Error> {
    let part_file = file_layout.part_file_path(part_index);
    let mut part_file = File::options().write(true).open(part_file)?;
    mht.write(&mut part_file)?;
    Ok(())
}

fn open_file_for_buffered_writing(path: &Path) -> Result<impl Write + Seek, Error> {
    let file = File::options().create(true).write(true).open(path)?;
    let file = BufWriter::with_capacity(8 * 1024 * 1024, file);
    Ok(file)
}

fn open_file_for_buffered_reading(path: &Path) -> Result<impl Read + Seek, Error> {
    let file = File::options().read(true).open(path)?;
    let file = BufReader::with_capacity(8 * 1024 * 1024, file);
    Ok(file)
}
