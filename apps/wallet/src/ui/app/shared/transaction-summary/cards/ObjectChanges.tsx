import { ChevronDown12, ChevronUp12 } from '@mysten/icons';
import {
    type SuiObjectChangeCreated,
    type SuiObjectChangeMutated,
} from '@mysten/sui.js';
import cx from 'classnames';
import { useState } from 'react';

import { Card } from '../Card';
// import { useGetNFTMeta } from '_src/ui/app/hooks';
import { Text } from '_src/ui/app/shared/text';

const labels = {
    created: 'Create',
    mutated: 'Update',
    minted: 'Mint',
};

interface ObjectChangeEntryProps {
    changes:
        | (SuiObjectChangeMutated[] & { minted: boolean })
        | (SuiObjectChangeCreated[] & { minted: boolean });
    type: 'created' | 'mutated' | 'minted';
}

function Item({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-2 overflow-auto">
            <Text variant="pBodySmall" color="steel-dark">
                {label}
            </Text>

            <Text
                variant="pBodySmall"
                color="steel"
                truncate
                mono
                title={value}
            >
                {value}
            </Text>
        </div>
    );
}

function ChevronDown({ expanded }: { expanded: boolean }) {
    return expanded ? (
        <ChevronUp12 className="text-gray-45" />
    ) : (
        <ChevronDown12 className="text-gray-45" />
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

    const regex = /^(.*?)::(.*?)::(.*)$/;
    const [, packageId, moduleName, functionName] =
        objectType.match(regex) ?? [];

    return (
        <>
            <div
                className="grid grid-cols-2 overflow-auto cursor-pointer"
                onClick={() => setExpanded((prev) => !prev)}
            >
                <div className="flex items-center gap-1">
                    <Text variant="pBodySmall" color="steel-dark">
                        Object
                    </Text>
                    <ChevronDown expanded={expanded} />
                </div>

                <Text
                    variant="pBodySmall"
                    color="steel"
                    truncate
                    title={objectType}
                    mono
                >
                    {objectType}
                </Text>
                {/* {minted && <NFTDetails objectId={objectId} />} */}
            </div>
            {expanded && (
                <div className="flex flex-col gap-1 pl-1">
                    <Item label="Package" value={packageId} />
                    <Item label="Module" value={moduleName} />
                    <Item label="Function" value={functionName} />
                </div>
            )}
        </>
    );
}

function ObjectChangeEntry({ changes, type }: ObjectChangeEntryProps) {
    const [expanded, setExpanded] = useState(true);
    if (!changes.length) return null;

    return (
        <Card heading="Changes">
            <div className={cx({ 'gap-4.5': expanded }, 'flex flex-col')}>
                <div
                    className="flex w-full flex-col gap-2 cursor-pointer"
                    onClick={() => setExpanded((prev) => !prev)}
                >
                    <div className="flex w-full items-center gap-2">
                        <Text
                            variant="body"
                            weight="semibold"
                            color={
                                type === 'created'
                                    ? 'success-dark'
                                    : 'steel-darker'
                            }
                        >
                            {labels[type]}
                        </Text>
                        <div className="h-[1px] bg-gray-40 w-full" />
                        <ChevronDown expanded={expanded} />
                    </div>
                </div>
                <div className="flex w-full flex-col gap-2">
                    {expanded &&
                        changes?.map(({ objectType, objectId }) => (
                            <ObjectDetail
                                objectType={objectType}
                                objectId={objectId}
                            />
                        ))}
                </div>
            </div>
        </Card>
    );
}

export function ObjectChanges({ changes }: { changes: any }) {
    if (!changes) return null;
    return (
        <>
            <ObjectChangeEntry type="mutated" changes={changes.mutated} />
            <ObjectChangeEntry type="created" changes={changes.created} />
        </>
    );
}
