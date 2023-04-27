// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { type MouseEventHandler, useCallback } from 'react';

export function useCopyToClipboard(
    textToCopy: string,
    callbackOnSuccess?: () => void
) {
    return useCallback<MouseEventHandler>(
        async (e) => {
            e.stopPropagation();
            e.preventDefault();
            try {
                await navigator.clipboard.writeText(textToCopy);
                if (callbackOnSuccess) {
                    callbackOnSuccess();
                }
            } catch (e) {
                // silence clipboard errors
            }
        },
        [textToCopy]
    );
}
