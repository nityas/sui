// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import {
    DryRunTransactionBlockResponse,
    type SuiAddress,
    type SuiTransactionBlockResponse,
    is,
    getExecutionStatusType,
    getTransactionDigest,
} from '@mysten/sui.js';
import { useMemo } from 'react';

import { getAmount } from '../utils/transaction/helpers/getAmount';
import { getBalanceChangeSummary } from '../utils/transaction/helpers/getBalanceChangeSummary';
import { getObjectChangeSummary } from '../utils/transaction/helpers/getObjectChangeSummary';
import { getLabel } from '../utils/transaction/helpers/getLabel';
import { getGasSummary } from '../utils/transaction/helpers/getGasSummary';

const getSummary = (
    transaction: DryRunTransactionBlockResponse | SuiTransactionBlockResponse,
    currentAddress?: SuiAddress
) => {
    const objectSummary = getObjectChangeSummary(transaction, currentAddress);
    const balanceChangeSummary = getBalanceChangeSummary(transaction);
    const amount = getAmount(transaction, currentAddress);
    const gas = getGasSummary(transaction);

    if (is(transaction, DryRunTransactionBlockResponse)) {
        return {
            gas,
            objectSummary,
            amount,
            balanceChanges: balanceChangeSummary,
        };
    } else {
        return {
            amount,
            gas,
            balanceChanges: balanceChangeSummary,
            digest: getTransactionDigest(transaction),
            label: getLabel(transaction),
            objectSummary,
            status: getExecutionStatusType(transaction),
            timestamp: transaction.timestampMs,
        };
    }
};

export function useTransactionAmount({
    transaction,
    currentAddress,
}: {
    transaction?: SuiTransactionBlockResponse | DryRunTransactionBlockResponse;
    currentAddress: SuiAddress;
}) {
    const amount = useMemo(() => {
        if (!transaction) return null;
        return getAmount(transaction, currentAddress);
    }, [transaction, currentAddress]);
    return amount;
}

export function useTransactionSummary({
    transaction,
    currentAddress,
}: {
    transaction?: SuiTransactionBlockResponse | DryRunTransactionBlockResponse;
    currentAddress?: SuiAddress;
}) {
    const summary = useMemo(() => {
        if (!transaction) return null;
        return getSummary(transaction, currentAddress);
    }, [transaction, currentAddress]);

    return summary;
}
