// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useTransactionSummary } from '@mysten/core';
import {
    type SuiTransactionBlockResponse,
    type SuiAddress,
} from '@mysten/sui.js';

import { DateCard } from '../../shared/date-card';
import { TransactionSummary } from '../../shared/transaction-summary';
import { ReceiptCardBg } from './ReceiptCardBg';
import { StakeTxnCard } from './StakeTxnCard';
import { StatusIcon } from './StatusIcon';
import { UnStakeTxnCard } from './UnstakeTxnCard';

type ReceiptCardProps = {
    txn: SuiTransactionBlockResponse;
    activeAddress: SuiAddress;
};

function TransactionStatus({
    success,
    timestamp,
}: {
    success: boolean;
    timestamp?: string;
}) {
    return (
        <div className="flex flex-col gap-3 items-center justify-center mb-4">
            <StatusIcon status={success} />
            {timestamp && <DateCard timestamp={Number(timestamp)} size="md" />}
        </div>
    );
}

export function ReceiptCard({ txn, activeAddress }: ReceiptCardProps) {
    const { events } = txn;
    const summary = useTransactionSummary({
        transaction: txn,
        currentAddress: activeAddress,
    });

    const stakedTxn = events?.find(
        ({ type }) => type === '0x3::validator::StakingRequestEvent'
    );

    const unstakeTxn = events?.find(
        ({ type }) => type === '0x3::validator::UnstakingRequestEvent'
    );

    // todo: re-using the existing staking cards for now
    if (stakedTxn || unstakeTxn)
        return (
            <div className="block relative w-full">
                <ReceiptCardBg status={summary?.status}>
                    {stakedTxn ? <StakeTxnCard event={stakedTxn} /> : null}
                    {unstakeTxn ? <UnStakeTxnCard event={unstakeTxn} /> : null}
                </ReceiptCardBg>
            </div>
        );

    return (
        <div className="block relative w-full">
            <TransactionStatus
                success={summary?.status === 'success'}
                timestamp={txn.timestampMs}
            />
            <TransactionSummary summary={summary} />
        </div>
    );
}
