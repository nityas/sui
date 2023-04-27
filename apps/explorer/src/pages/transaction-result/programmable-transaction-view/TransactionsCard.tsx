// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { type SuiTransaction } from '@mysten/sui.js';

import { Transaction } from './Transaction';

import {
    TransactionCard,
    TransactionCardSection,
    useTransactionCardControl,
} from '~/pages/transaction-result/TransactionCard';

interface TransactionsCardProps {
    transactions: SuiTransaction[];
}

export function TransactionsCard({ transactions }: TransactionsCardProps) {
    const collapsedThreshold = transactions.length > 5;

    const {
        expandedSection,
        isShowAll,
        handleToggleSection,
        handleToggleShowAll,
    } = useTransactionCardControl(transactions.length, collapsedThreshold, 3);

    const showAllProps = collapsedThreshold
        ? {
              handleOnClick: () => handleToggleShowAll(!isShowAll),
              label: isShowAll
                  ? 'Show less'
                  : `Show all ${transactions.length} Transactions`,
          }
        : undefined;

    if (!transactions?.length) {
        return null;
    }

    return (
        <TransactionCard
            collapsible
            title="Transactions"
            showAll={showAllProps}
        >
            {transactions.map((transaction, index) => {
                const [[type, data]] = Object.entries(transaction);

                return (
                    <TransactionCardSection
                        key={index}
                        title={type}
                        expanded={expandedSection[index]}
                        setExpanded={handleToggleSection(index)}
                    >
                        <Transaction key={index} type={type} data={data} />
                    </TransactionCardSection>
                );
            })}
        </TransactionCard>
    );
}
