import { type TransactionSummary as TransactionSummaryType } from '@mysten/core';

import { BalanceChanges } from './cards/BalanceChanges';
import { ExplorerLinkCard } from './cards/ExplorerLink';
import { GasSummary } from './cards/GasSummary';
import { ObjectChanges } from './cards/ObjectChanges';

export function TransactionSummary({
    summary,
    showGasSummary = true,
}: {
    summary?: TransactionSummaryType | null;
    showGasSummary?: boolean;
}) {
    if (!summary) return null;
    return (
        <section className="-mx-5 bg-sui/10">
            <div>
                <div className="px-5 py-10">
                    <div className="flex flex-col gap-4">
                        {/*  
                        <TotalAmount
                            amount={summary?.amount?.total}
                            coinType={summary?.amount?.coinType}
                        /> */}
                        <BalanceChanges changes={summary.balanceChanges} />
                        <ObjectChanges changes={summary.objectSummary} />
                        {showGasSummary && (
                            <GasSummary gasSummary={summary?.gas} />
                        )}
                        <ExplorerLinkCard
                            digest={summary?.digest}
                            timestamp={summary?.timestamp}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
