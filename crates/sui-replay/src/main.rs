use std::path::PathBuf;

use sui_replay::{checker::check_and_print_interesting_packages, debug337::DebugOpener};

const PATH: &str = "/opt/sui/db/authorities_db/full_node_db/live/store/perpetual";

fn main() {
    let debugger = DebugOpener::new(PathBuf::from(PATH));
    check_and_print_interesting_packages(debugger.follow_object_table()).unwrap();
}
