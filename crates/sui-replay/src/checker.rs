// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use std::collections::{HashMap, HashSet};

use move_binary_format::{file_format::AbilitySet, file_format_common::VERSION_MAX};
use move_core_types::language_storage::ModuleId;
use sui_types::{base_types::ObjectID, object::Object, Identifier};

pub type PackageVersionMap = HashMap<ObjectID, HashSet<ObjectID>>;
pub struct TypeMap(pub HashMap<QualifiedType, TypeInfo>);

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
pub struct QualifiedType {
    pub original_package_id: ObjectID,
    pub module_name: String,
    pub type_name: Identifier,
}

#[derive(Debug, Clone)]
pub struct TypeInfo {
    pub seen_with_store: bool,
    pub seen_without_store: bool,
}

impl TypeInfo {
    pub fn new(ability_set: AbilitySet) -> Self {
        Self {
            seen_with_store: ability_set.has_store(),
            seen_without_store: !ability_set.has_store(),
        }
    }

    pub fn update(&mut self, ability_set: AbilitySet) {
        self.seen_with_store |= ability_set.has_store();
        self.seen_without_store |= !ability_set.has_store();
    }
}

impl TypeMap {
    pub fn new() -> Self {
        Self(HashMap::new())
    }

    pub fn add(&mut self, qual_type: QualifiedType, ability_set: AbilitySet) {
        let entry = self
            .0
            .entry(qual_type)
            .or_insert_with(|| TypeInfo::new(ability_set));
        entry.update(ability_set);
    }
}

pub fn check_and_print_interesting_packages(
    package_iter: impl IntoIterator<Item = (ObjectID, Object)>,
) -> anyhow::Result<()> {
    let (type_map, package_map) = check_packages(package_iter)?;
    print_interesting_packages(type_map, package_map);
    Ok(())
}

pub fn check_packages(
    package_iter: impl IntoIterator<Item = (ObjectID, Object)>,
) -> anyhow::Result<(TypeMap, PackageVersionMap)> {
    let mut package_version_object_ids = HashMap::new();
    let mut qualified_types = TypeMap::new();

    for (obj_id, obj) in package_iter {
        // It dang well better be a move package
        let move_package = obj.data.try_as_package().unwrap();
        let original_package_id = move_package.original_package_id();

        // Record this as a version of the package
        package_version_object_ids
            .entry(original_package_id)
            .or_insert_with(HashSet::new)
            .insert(obj_id);
        let modules = move_package.normalize(VERSION_MAX)?;
        for (module_name, module) in modules.into_iter() {
            for (struct_name, struct_type) in module.structs {
                let qual_type = QualifiedType {
                    original_package_id,
                    module_name: module_name.clone(),
                    type_name: struct_name,
                };
                qualified_types.add(qual_type, struct_type.abilities);
            }
        }
    }

    Ok((qualified_types, package_version_object_ids))
}

pub fn print_interesting_packages(type_map: TypeMap, package_map: PackageVersionMap) {
    let mut interesting = HashMap::new();
    // Collect by original package id
    for (qual_type, type_info) in type_map.0.into_iter() {
        if type_info.seen_with_store && type_info.seen_without_store {
            interesting
                .entry(qual_type.original_package_id)
                .or_insert_with(HashSet::new)
                .insert((qual_type.module_name, qual_type.type_name.clone()));
        }
    }

    for (package_id, types_of_interest) in interesting {
        println!("----------------------------------");
        println!(
            "Package IDs[{}]: {:?}",
            package_id,
            package_map.get(&package_id).unwrap()
        );
        println!("Types of interest:");
        for (module_name, type_name) in types_of_interest {
            println!("\t{}::{}", module_name, type_name);
        }
        println!("----------------------------------");
    }
}
