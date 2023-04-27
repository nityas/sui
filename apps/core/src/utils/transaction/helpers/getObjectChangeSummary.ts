// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import {
    COIN_TYPE_ARG_REGEX,
    type SuiTransactionBlockResponse,
    type SuiAddress,
    type DryRunTransactionBlockResponse,
    SuiObjectChange,
} from '@mysten/sui.js';

export const getObjectChangeSummary = (
    transaction: DryRunTransactionBlockResponse | SuiTransactionBlockResponse,
    currentAddress?: SuiAddress | null
) => {
    const { objectChanges } = transaction;
    if (!objectChanges) return null;

    const mutated = objectChanges.filter((change) => change.type === 'mutated');

    let created = objectChanges
        .filter((change) =>
            currentAddress
                ? change.type === 'created' && change.sender === currentAddress
                : change.type === 'created'
        )
        .map((change) => {
            const changeOwnerAddress =
                change.type === 'created' &&
                typeof change.owner === 'object' &&
                'AddressOwner' in change.owner &&
                change.owner.AddressOwner;

            const isMinted =
                change.type === 'created' && change.sender === currentAddress
                    ? currentAddress
                    : changeOwnerAddress &&
                      !change.objectType.match(COIN_TYPE_ARG_REGEX);

            return {
                ...change,
                minted: isMinted,
            };
        });

    const transferred = objectChanges.filter((change) => {
        const changeOwnerAddress =
            change.type === 'created' &&
            typeof change.owner === 'object' &&
            'AddressOwner' in change.owner &&
            change.owner.AddressOwner;

        return (
            change.type === 'mutated' &&
            change.sender ===
                (currentAddress ? currentAddress : changeOwnerAddress)
        );
    });

    return {
        mutated,
        created,
        transferred,
    };
};
