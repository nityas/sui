// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { ChevronRight12 } from '@mysten/icons';
import {
    type SuiObjectChangeCreated,
    type SuiObjectChangeMutated,
} from '@mysten/sui.js';
import clsx from 'clsx';
import { useState } from 'react';

import { TransactionCard, TransactionCardSection } from '../TransactionCard';

import { AddressLink, ObjectLink } from '~/ui/InternalLink';
import { Text } from '~/ui/Text';

const OWNER_GROUP_DIVIDER = '__';

enum Labels {
    created = 'Created',
    mutated = 'Updated',
    minted = 'Mint',
    transferred = 'Transfer',
}

interface ObjectChangeEntryBaseProps {
    type: keyof typeof Labels;
}

enum ItemLabels {
    package = 'Package',
    module = 'Module',
    function = 'Function',
}

function Item({
    label,
    packageId,
    moduleName,
    functionName,
}: {
    label: ItemLabels;
    packageId: string;
    moduleName: string;
    functionName: string;
}) {
    return (
        <div className="flex justify-between gap-10">
            <Text variant="pBody/medium" color="steel-dark">
                {label}
            </Text>

            {label === ItemLabels.package && (
                <ObjectLink objectId={packageId} />
            )}
            {label === ItemLabels.module && (
                <ObjectLink
                    objectId={`${packageId}?module=${moduleName}`}
                    label={moduleName}
                />
            )}
            {label === ItemLabels.function && (
                <Text truncate variant="pBody/medium" color="hero-dark">
                    {functionName}
                </Text>
            )}
        </div>
    );
}

function ObjectDetail({
    objectType,
    objectId,
}: {
    objectType: string;
    objectId: string;
}) {
    const [expanded, setExpanded] = useState(false);
    const toggleExpand = () => setExpanded((prev) => !prev);

    const regex = /^(.*?)::(.*?)::(.*)$/;
    const [, packageId, moduleName, functionName] =
        objectType.match(regex) ?? [];

    const objectDetailLabels = [
        ItemLabels.package,
        ItemLabels.module,
        ItemLabels.function,
    ];

    return (
        <>
            <div
                role="button"
                className="flex cursor-pointer justify-between"
                onClick={toggleExpand}
            >
                <div className="flex items-center gap-1">
                    <Text variant="pBody/medium" color="steel-dark">
                        Object
                    </Text>
                    <ChevronRight12
                        height={12}
                        width={12}
                        className={clsx(
                            'text-steel-dark',
                            expanded && 'rotate-90'
                        )}
                    />
                </div>

                <ObjectLink objectId={objectId} />
                {/* {minted && <NFTDetails objectId={objectId} />} */}
            </div>
            {expanded && (
                <div className="flex flex-col gap-1">
                    {objectDetailLabels.map((label) => (
                        <Item
                            key={label}
                            label={label}
                            packageId={packageId}
                            moduleName={moduleName}
                            functionName={functionName}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

interface ObjectChangeEntryProps extends ObjectChangeEntryBaseProps {
    changeEntries: (
        | (SuiObjectChangeMutated & { minted: boolean })
        | (SuiObjectChangeCreated & { minted: boolean })
    )[];
}

function ObjectChangeEntry({ changeEntries, type }: ObjectChangeEntryProps) {
    const [expanded, setExpanded] = useState(true);

    const title = Labels[type];

    return (
        <TransactionCardSection
            expanded={expanded}
            setExpanded={setExpanded}
            title={
                <Text
                    variant="body/semibold"
                    color={
                        title === Labels.created
                            ? 'success-dark'
                            : 'steel-darker'
                    }
                >
                    {title}
                </Text>
            }
        >
            {changeEntries?.map(({ objectType, objectId }) => (
                <ObjectDetail
                    key={objectId}
                    objectType={objectType}
                    objectId={objectId}
                />
            ))}
        </TransactionCardSection>
    );
}

interface ObjectChangeEntryUpdatedProps extends ObjectChangeEntryBaseProps {
    data: Record<string, SuiObjectChangeMutated[] & { minted: boolean }[]>;
}

export function ObjectChangeEntryUpdated({
    data,
    type,
}: ObjectChangeEntryUpdatedProps) {
    const [expanded, setExpanded] = useState(true);

    if (!data) {
        return null;
    }

    const title = Labels[type];

    const changeObjectEntries = Object.entries(data);

    return (
        <>
            {changeObjectEntries.map(([address, changes]) => {
                const [type, locationId] = address.split(OWNER_GROUP_DIVIDER);

                const renderFooter =
                    type === 'AddressOwner' ||
                    type === 'ObjectOwner' ||
                    type === 'Shared';

                return (
                    <TransactionCard
                        key={address}
                        title="Changes"
                        size="sm"
                        shadow="default"
                        footer={
                            renderFooter && (
                                <div className="flex items-center justify-between">
                                    <Text
                                        variant="pBody/medium"
                                        color="steel-dark"
                                    >
                                        {type === 'Shared' ? 'Shared' : 'Owner'}
                                    </Text>
                                    {type === 'AddressOwner' && (
                                        <AddressLink address={locationId} />
                                    )}
                                    {type === 'ObjectOwner' && (
                                        <ObjectLink objectId={locationId} />
                                    )}
                                    {type === 'Shared' && (
                                        <Text
                                            variant="pBody/medium"
                                            color="hero-dark"
                                        >
                                            {locationId}
                                        </Text>
                                    )}
                                </div>
                            )
                        }
                    >
                        <TransactionCardSection
                            expanded={expanded}
                            setExpanded={setExpanded}
                            title={
                                <Text
                                    variant="body/semibold"
                                    color="success-dark"
                                >
                                    {title}
                                </Text>
                            }
                        >
                            {changes.map(({ objectId, objectType }) => (
                                <ObjectDetail
                                    key={objectId}
                                    objectId={objectId}
                                    objectType={objectType}
                                />
                            ))}
                        </TransactionCardSection>
                    </TransactionCard>
                );
            })}
        </>
    );
}

function groupByOwner(objectSummaryChanges: any) {
    if (!objectSummaryChanges) {
        return {};
    }

    return objectSummaryChanges?.reduce(
        (mapByOwner: Record<string, any>, change: any) => {
            const owner = change?.owner;

            let key = '';
            if ('AddressOwner' in owner) {
                key = `AddressOwner${OWNER_GROUP_DIVIDER}${owner.AddressOwner}`;
            } else if ('ObjectOwner' in owner) {
                key = `ObjectOwner${OWNER_GROUP_DIVIDER}${owner.ObjectOwner}`;
            } else if ('Shared' in owner) {
                key = `Shared${OWNER_GROUP_DIVIDER}${owner.Shared?.initial_shared_version}`;
            } else {
                const ownerKeys = Object.keys(owner);
                const firstKey = ownerKeys[0];
                key = `${firstKey}${OWNER_GROUP_DIVIDER}${owner[firstKey]}`;
            }

            mapByOwner[key] = mapByOwner[key] || [];
            mapByOwner[key].push(change);
            return mapByOwner;
        },
        {}
    );
}

export function ObjectChanges({ objectSummary }: { objectSummary: any }) {
    if (!objectSummary) {
        return null;
    }

    const createdChangesByOwner = groupByOwner(objectSummary?.created);
    const createdChangesData = Object.values(createdChangesByOwner);

    const updatedChangesByOwner = groupByOwner(objectSummary?.mutated);

    const transferredChangesByOwner = groupByOwner(objectSummary?.transferred);

    return (
        <>
            {objectSummary?.created?.length ? (
                <TransactionCard title="Changes" size="sm" shadow="default">
                    {createdChangesData.map((data, index) => (
                        <ObjectChangeEntry
                            key={index}
                            type="created"
                            changeEntries={
                                data as (SuiObjectChangeCreated & {
                                    minted: boolean;
                                })[]
                            }
                        />
                    ))}
                </TransactionCard>
            ) : null}

            {objectSummary.mutated?.length ? (
                <ObjectChangeEntryUpdated
                    type="mutated"
                    data={updatedChangesByOwner}
                />
            ) : null}

            {objectSummary.transferred?.length ? (
                <ObjectChangeEntryUpdated
                    type="transferred"
                    data={transferredChangesByOwner}
                />
            ) : null}
        </>
    );
}
