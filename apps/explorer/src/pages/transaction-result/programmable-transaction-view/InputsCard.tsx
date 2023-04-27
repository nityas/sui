// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { type SuiCallArg } from '@mysten/sui.js';

import {
    TransactionCard,
    TransactionCardSection,
    useTransactionCardControl,
} from '~/pages/transaction-result/TransactionCard';
import { AddressLink, ObjectLink } from '~/ui/InternalLink';
import { Text } from '~/ui/Text';

interface InputsCardProps {
    inputs: SuiCallArg[];
}

export function InputsCard({ inputs }: InputsCardProps) {
    const collapsedThreshold = inputs.length > 5;

    const {
        expandedSection,
        isShowAll,
        handleToggleSection,
        handleToggleShowAll,
    } = useTransactionCardControl(inputs.length, collapsedThreshold, 3);

    const showAllProps = collapsedThreshold
        ? {
              handleOnClick: () => handleToggleShowAll(!isShowAll),
              label: isShowAll
                  ? 'Show less'
                  : `Show all ${inputs.length} Inputs`,
          }
        : undefined;

    if (!inputs?.length) {
        return null;
    }

    return (
        <TransactionCard collapsible title="Inputs" showAll={showAllProps}>
            {inputs.map((input, index) => {
                const inputKeys = Object.keys(input);
                const inputTitle = `Input ${index + 1}`;

                return (
                    <TransactionCardSection
                        key={inputTitle}
                        expanded={expandedSection[index]}
                        setExpanded={handleToggleSection(index)}
                        title={inputTitle}
                    >
                        <div className="flex flex-col gap-3">
                            {inputKeys.map((key) => {
                                const regNumber = /^\d+$/;
                                const value = input[key as keyof typeof input];

                                let renderValue;

                                if (key === 'mutable') {
                                    renderValue = String(value);
                                } else if (regNumber.test(value)) {
                                    renderValue =
                                        Number(value).toLocaleString();
                                } else if (key === 'objectId') {
                                    renderValue = (
                                        <ObjectLink objectId={value} />
                                    );
                                } else if (
                                    'valueType' in input &&
                                    'value' in input &&
                                    input.valueType === 'address' &&
                                    key === 'value'
                                ) {
                                    renderValue = (
                                        <AddressLink address={value} />
                                    );
                                } else {
                                    renderValue = value;
                                }

                                return (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between gap-12"
                                    >
                                        <Text
                                            variant="pBody/medium"
                                            color="steel-dark"
                                        >
                                            {key}
                                        </Text>

                                        <Text
                                            capitalize
                                            truncate
                                            variant="pBody/medium"
                                            color="steel-darker"
                                        >
                                            {renderValue}
                                        </Text>
                                    </div>
                                );
                            })}
                        </div>
                    </TransactionCardSection>
                );
            })}
        </TransactionCard>
    );
}
