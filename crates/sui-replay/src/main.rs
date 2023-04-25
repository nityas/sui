use std::fs::File;
use std::io::{self, prelude::*, BufReader};
use std::path::PathBuf;
use std::str::FromStr;

use sui_replay::{checker::check_and_print_interesting_packages, debug337::DebugOpener};
use sui_types::base_types::ObjectID;

const PATH: &str = "/opt/sui/db/authorities_db/full_node_db/live/store/perpetual";

#[tokio::main]
async fn main() {
    let file = File::open("file.txt").unwrap();
    let reader = BufReader::new(file);

    let obj_ids: Vec<_> = reader
        .lines()
        .map(|line| {
            let line = line.unwrap();
            ObjectID::from_hex_literal(&line).unwrap()
        })
        .collect();

    let debugger = DebugOpener::new(PathBuf::from(PATH));
    check_and_print_interesting_packages(debugger.follow_object_table_by_file(obj_ids)).unwrap();
}
