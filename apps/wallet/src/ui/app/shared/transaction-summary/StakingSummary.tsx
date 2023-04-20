// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { type TransactionSummary as TransactionSummaryType } from '@mysten/core';

import { BalanceChanges } from './cards/BalanceChanges';
import { ExplorerLinkCard } from './cards/ExplorerLink';
import { GasSummary } from './cards/GasSummary';
import { ObjectChanges } from './cards/ObjectChanges';

export function TransactionSummary({
    summary,
    showGasSummary = true,
}: {
    summary?: TransactionSummaryType;
    showGasSummary?: boolean;
}) {
    if (!summary) return null;

    return (
        <section className="-mx-5 bg-sui/10">
            <div>
                <div className="px-5 py-10">
                    <div className="flex flex-col gap-4"></div>
                </div>
            </div>
        </section>
    );
}
