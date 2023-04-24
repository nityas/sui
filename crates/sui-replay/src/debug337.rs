use std::path::PathBuf;
use sui_core::authority::authority_store_tables::AuthorityPerpetualTables;
use sui_core::authority::authority_store_types::{StoreData, StoreObjectV1, StoreObjectWrapper};
use sui_types::base_types::ObjectID;
use sui_types::object::{Data, Object};
use sui_types::storage::ObjectKey;
use typed_store::rocks::{DBMap, MetricConf};
use typed_store::Map;

pub struct DebugOpener {
    path: PathBuf,
    db: DBMap<ObjectKey, StoreObjectWrapper>,
}

impl DebugOpener {
    pub fn new(path: PathBuf) -> Self {
        println!(
            "Opening authority perpetual object table at path: {:?}",
            path
        );
        let pep_tables = AuthorityPerpetualTables::get_read_only_handle(
            path.clone(),
            None,
            None,
            MetricConf::default(),
        );
        pep_tables.objects.try_catch_up_with_primary().unwrap();
        Self {
            path,
            db: pep_tables.objects,
        }
    }

    pub fn follow_object_table(&self) -> impl Iterator<Item = (ObjectID, Object)> + '_ {
        println!(
            "Following authority perpetual object table at path: {:?}",
            self.path
        );

        self.db.iter().filter_map(|(key, wrapper)| {
            if let StoreObjectWrapper::V1(StoreObjectV1::Value(o)) = wrapper {
                if let StoreData::Package(p) = o.data {
                    return Some((
                        p.id(),
                        Object {
                            data: Data::Package(p),
                            owner: o.owner,
                            previous_transaction: o.previous_transaction,
                            storage_rebate: o.storage_rebate,
                        },
                    ));
                }
            }
            None
        })
    }
}
