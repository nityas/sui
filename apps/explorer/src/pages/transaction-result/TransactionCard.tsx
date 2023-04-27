// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { ChevronDown12, ChevronUp16 } from '@mysten/icons';
import clsx from 'clsx';
import { type ReactNode, useCallback, useEffect, useState } from 'react';

import { Button } from '~/ui/Button';
import { Card, type CardProps } from '~/ui/Card';
import { Divider } from '~/ui/Divider';
import { Heading } from '~/ui/Heading';
import { Text } from '~/ui/Text';

type Size = 'md' | 'sm';

export function useTransactionCardControl(
    inputsCount: number,
    collapsedOnMount?: boolean,
    collapseStart?: number
) {
    const [expandedSection, setExpandedSection] = useState<boolean[]>(
        Array(inputsCount).fill(false)
    );

    const isShowAll = expandedSection.every(Boolean);

    const handleToggleShowAll = useCallback(
        (isShowAll: boolean) => {
            const newExpandedSection = Array(inputsCount).fill(isShowAll);
            newExpandedSection.fill(isShowAll);
            setExpandedSection(newExpandedSection);
        },
        [inputsCount]
    );

    const handleToggleSection = useCallback(
        (index: number) => (isExpanded: boolean) => {
            const newExpandedSection = [...expandedSection];
            newExpandedSection[index] = isExpanded;
            setExpandedSection(newExpandedSection);
        },
        [expandedSection]
    );

    useEffect(() => {
        const newExpandedSection = Array(inputsCount).fill(true);

        if (collapsedOnMount && collapseStart) {
            for (let i = collapseStart; i < inputsCount; i++) {
                newExpandedSection[i] = false;
            }
        }

        setExpandedSection(newExpandedSection);
    }, [collapseStart, collapsedOnMount, inputsCount]);

    return {
        expandedSection,
        isShowAll,
        handleToggleSection,
        handleToggleShowAll,
    };
}

interface TransactionCardSectionProps {
    children: ReactNode;
    expanded: boolean;
    setExpanded?: (expanded: boolean) => void;
    title?: string | ReactNode;
}

export function TransactionCardSection({
    title,
    expanded,
    setExpanded,
    children,
}: TransactionCardSectionProps) {
    const toggleExpanded = () => {
        if (setExpanded) {
            setExpanded(!expanded);
        }
    };

    return (
        <div className="flex w-full flex-col gap-3">
            {title && (
                <div
                    role="button"
                    className="flex items-center gap-2"
                    onClick={toggleExpanded}
                >
                    {typeof title === 'string' ? (
                        <Text color="steel-darker" variant="body/semibold">
                            {title}
                        </Text>
                    ) : (
                        title
                    )}
                    <Divider />
                    <ChevronDown12
                        height={12}
                        width={12}
                        className={clsx(
                            'cursor-pointer text-gray-45',
                            !expanded && 'rotate-180'
                        )}
                    />
                </div>
            )}

            {expanded && children}
        </div>
    );
}

interface TransactionCardProps extends CardProps {
    children: ReactNode;
    title?: string | ReactNode;
    footer?: ReactNode;
    collapsible?: boolean;
    size?: Size;
    showAll?: {
        handleOnClick: () => void;
        label: string;
    };
}

export function TransactionCard({
    title,
    footer,
    collapsible,
    size = 'md',
    showAll,
    children,
    ...cardProps
}: TransactionCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleExpandClick = () =>
        setIsExpanded((prevIsExpanded: boolean) => !prevIsExpanded);

    return (
        <div className="w-full">
            <Card
                rounded="2xl"
                border="gray45"
                bg="white"
                spacing="none"
                {...cardProps}
            >
                <div
                    className={clsx(
                        size === 'md' ? 'px-6 py-7' : 'px-4 py-4.5'
                    )}
                >
                    {title && (
                        <div
                            className={clsx(
                                'flex justify-between',
                                isExpanded && 'mb-6'
                            )}
                        >
                            <Heading
                                variant={
                                    size === 'md'
                                        ? 'heading4/semibold'
                                        : 'heading6/semibold'
                                }
                                color="steel-darker"
                            >
                                {title}
                            </Heading>

                            {collapsible && (
                                <ChevronUp16
                                    className={clsx(
                                        'cursor-pointer text-steel',
                                        isExpanded && 'rotate-180'
                                    )}
                                    onClick={handleExpandClick}
                                />
                            )}
                        </div>
                    )}

                    {(isExpanded || !title) && (
                        <div className="flex flex-col gap-6">{children}</div>
                    )}

                    {showAll && (
                        <div className="mt-6 flex items-center gap-2">
                            <Button
                                padding="none"
                                variant="tertiary"
                                onClick={showAll.handleOnClick}
                            >
                                {showAll.label}
                            </Button>

                            <Divider />
                        </div>
                    )}
                </div>

                {footer && (
                    <div
                        className={clsx(
                            'rounded-b-2xl bg-sui/10 py-2.5',
                            size === 'md' ? 'px-6' : 'px-4'
                        )}
                    >
                        {footer}
                    </div>
                )}
            </Card>
        </div>
    );
}
