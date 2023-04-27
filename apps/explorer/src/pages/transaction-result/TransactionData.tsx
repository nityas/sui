// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { CoinFormat, useCopyToClipboard, useFormatCoin } from '@mysten/core';
import { Copy12 } from '@mysten/icons';
import {
    getGasData,
    getTotalGasUsed,
    getTransactionKind,
    getTransactionKindName,
    type ProgrammableTransaction,
    SUI_TYPE_ARG,
    type SuiTransactionBlockResponse,
} from '@mysten/sui.js';
import { toast } from 'react-hot-toast';

import {
    TransactionCard,
    TransactionCardSection,
} from '~/pages/transaction-result/TransactionCard';
import { InputsCard } from '~/pages/transaction-result/programmable-transaction-view/InputsCard';
import { TransactionsCard } from '~/pages/transaction-result/programmable-transaction-view/TransactionsCard';
import { DescriptionItem } from '~/ui/DescriptionList';
import { Divider } from '~/ui/Divider';
import { Heading } from '~/ui/Heading';
import { CheckpointSequenceLink, ObjectLink } from '~/ui/InternalLink';
import { Text } from '~/ui/Text';

function GasAmount({
    amount,
    isFooter,
    isHighlighted,
}: {
    amount?: bigint | number;
    isFooter?: boolean;
    isHighlighted?: boolean;
}) {
    const [formattedAmount, symbol] = useFormatCoin(
        amount,
        SUI_TYPE_ARG,
        CoinFormat.FULL
    );

    return (
        <div className="flex h-full items-center gap-1">
            <div className="flex items-baseline gap-1 text-steel-darker">
                <Text
                    variant={isFooter ? 'pBody/semibold' : 'pBody/medium'}
                    color={isHighlighted ? 'success-dark' : 'steel-darker'}
                >
                    {formattedAmount}
                </Text>
                <Text
                    variant="subtitleSmall/medium"
                    color={isHighlighted ? 'success-dark' : 'steel-darker'}
                >
                    {symbol}
                </Text>
            </div>

            <Text variant="bodySmall/medium">
                <div className="flex items-center text-steel">
                    (
                    <div className="flex items-baseline gap-0.5">
                        <Text variant="body/medium">
                            {amount?.toLocaleString()}
                        </Text>
                        <Text variant="subtitleSmall/medium">MIST</Text>
                    </div>
                    )
                </div>
            </Text>
        </div>
    );
}

function TotalGasAmount({ amount }: { amount?: bigint | number }) {
    const [formattedAmount, symbol] = useFormatCoin(
        amount,
        SUI_TYPE_ARG,
        CoinFormat.FULL
    );

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-0.5">
                <Heading variant="heading3/semibold" color="steel-darker">
                    {formattedAmount}
                </Heading>
                <Text variant="body/medium" color="steel-dark">
                    {symbol}
                </Text>
            </div>

            <div className="flex items-center gap-0.5">
                <Heading variant="heading6/medium" color="steel">
                    {amount?.toLocaleString()}
                </Heading>
                <Text variant="body/medium" color="steel">
                    MIST
                </Text>
            </div>
        </div>
    );
}

interface Props {
    transaction: SuiTransactionBlockResponse;
}

export function TransactionData({ transaction }: Props) {
    const gasData = getGasData(transaction)!;
    const gasPayment = gasData.payment;
    const gasUsed = transaction?.effects!.gasUsed;
    const gasPrice = gasData.price || 1;
    const gasBudget = gasData.budget;

    const copyToClipBoard = useCopyToClipboard(gasPayment[0].objectId, () =>
        toast.success('Copied!')
    );

    const transactionKindName = getTransactionKindName(
        getTransactionKind(transaction)!
    );

    const programmableTxn = transaction.transaction!.data
        .transaction as ProgrammableTransaction;

    return (
        <div className="flex flex-wrap gap-6">
            <section className="flex w-[369px] flex-1 flex-col gap-6">
                {transactionKindName === 'ProgrammableTransaction' && (
                    <InputsCard inputs={programmableTxn.inputs} />
                )}

                {transaction.checkpoint && (
                    <TransactionCard>
                        <TransactionCardSection expanded>
                            <DescriptionItem title="Checkpoint">
                                <CheckpointSequenceLink
                                    noTruncate
                                    label={Number(
                                        transaction.checkpoint
                                    ).toLocaleString()}
                                    sequence={transaction.checkpoint}
                                />
                            </DescriptionItem>
                        </TransactionCardSection>
                    </TransactionCard>
                )}
            </section>

            <section className="flex flex-1 flex-col gap-6">
                {transactionKindName === 'ProgrammableTransaction' && (
                    <TransactionsCard
                        transactions={programmableTxn.transactions}
                    />
                )}

                <section data-testid="gas-breakdown">
                    <TransactionCard
                        collapsible
                        title={
                            <div className="flex flex-col gap-3">
                                <Heading
                                    variant="heading4/semibold"
                                    color="steel-darker"
                                >
                                    Gas & Storage Fee
                                </Heading>
                                <TotalGasAmount
                                    amount={getTotalGasUsed(transaction)}
                                />
                            </div>
                        }
                    >
                        <TransactionCardSection expanded>
                            <Divider />

                            <DescriptionItem
                                title={
                                    <Text capitalize variant="pBody/semibold">
                                        gas payment
                                    </Text>
                                }
                            >
                                <div className="flex items-center gap-1">
                                    <ObjectLink
                                        // TODO: support multiple gas coins
                                        objectId={gasPayment[0].objectId}
                                    />
                                    <Copy12
                                        className="h-3 w-3 cursor-pointer text-steel"
                                        onClick={copyToClipBoard}
                                    />
                                </div>
                            </DescriptionItem>
                            <DescriptionItem
                                title={
                                    <Text capitalize variant="pBody/semibold">
                                        gas budget
                                    </Text>
                                }
                            >
                                <GasAmount amount={BigInt(gasBudget)} />
                            </DescriptionItem>

                            <Divider />

                            <DescriptionItem
                                title={
                                    <Text capitalize variant="pBody/semibold">
                                        gas price
                                    </Text>
                                }
                            >
                                <GasAmount amount={BigInt(gasPrice)} />
                            </DescriptionItem>
                            <DescriptionItem
                                title={
                                    <Text capitalize variant="pBody/semibold">
                                        computation fee
                                    </Text>
                                }
                            >
                                <GasAmount
                                    amount={Number(gasUsed?.computationCost)}
                                />
                            </DescriptionItem>

                            <DescriptionItem
                                title={
                                    <Text capitalize variant="pBody/semibold">
                                        storage fee
                                    </Text>
                                }
                            >
                                <GasAmount
                                    amount={Number(gasUsed?.storageCost)}
                                />
                            </DescriptionItem>

                            <div className="mt-2">
                                <DescriptionItem
                                    border
                                    title={
                                        <Text
                                            capitalize
                                            variant="pBody/semibold"
                                            color="success-dark"
                                        >
                                            storage rebate
                                        </Text>
                                    }
                                >
                                    <GasAmount
                                        isHighlighted
                                        amount={-Number(gasUsed?.storageRebate)}
                                    />
                                </DescriptionItem>
                            </div>
                        </TransactionCardSection>
                    </TransactionCard>
                </section>
            </section>
        </div>
    );
}
