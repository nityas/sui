// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import MoonPay from './icons/MoonPay.svg';
import Transak from './icons/Transak.svg';
import { type OnrampProvider } from './types';

const TRANSAK_API_KEY =
    process.env.NODE_ENV === 'production'
        ? '0318063c-0380-4e20-9c73-e08836240c17'
        : 'c72e867b-4069-4e22-a01e-4553353faefd';

const MOONPAY_API_KEY = 'pk_test_RwNag1qi8jFoymVchhCSc5cYnqyPrVd5';

const BACKEND_HOST =
    process.env.NODE_ENV === 'production'
        ? 'https://apps-backend.sui.io'
        : 'http://localhost:3003';

const ONRAMP_PROVIDER: OnrampProvider[] = [
    {
        key: 'transak',
        icon: Transak,
        name: 'Transak',
        checkSupported: async () => process.env.NODE_ENV !== 'production',
        getUrl: async (address) => {
            const params = new URLSearchParams({
                apiKey: TRANSAK_API_KEY,
                cryptoCurrencyCode: 'ETH',
                walletAddress: '0x000000000000000000000000000000000000dead',
                disableWalletAddressForm: 'true',
                themeColor: '#6fbcf0',
            });

            return process.env.NODE_ENV === 'production'
                ? `https://global.transak.com?${params}`
                : `https://global-stg.transak.com?${params}`;
        },
    },
    {
        key: 'moonpay',
        icon: MoonPay,
        name: 'MoonPay',
        checkSupported: async () => {
            if (process.env.NODE_ENV === 'production') return false;

            try {
                const res = await fetch(
                    `https://api.moonpay.com/v4/ip_address?apiKey=${MOONPAY_API_KEY}`
                );
                const data = (await res.json()) as {
                    isAllowed: boolean;
                    isBuyAllowed: boolean;
                    isSellAllowed: boolean;
                };

                return data.isAllowed && data.isBuyAllowed;
            } catch {
                return false;
            }
        },
        getUrl: async (address) => {
            const params = new URLSearchParams({
                address: '0x000000000000000000000000000000000000dead',
                environment:
                    process.env.NODE_ENV === 'production'
                        ? 'PRODUCTION'
                        : 'STAGING',
            });

            const res = await fetch(`${BACKEND_HOST}/moonpay-url?${params}`);

            const data = (await res.json()) as { url: string };

            return data.url;
        },
    },
];

const PREFERRED_ONRAMP_PROVIDER_KEY = 'preferred-onramp-provider';

export function useOnrampProviders() {
    const [preferredProviderKey, setPreferredProviderKey] = useState(() =>
        localStorage.getItem(PREFERRED_ONRAMP_PROVIDER_KEY)
    );

    const { data } = useQuery(
        ['onramp', 'get-providers'],
        async () => {
            const supportedProviders = await Promise.all(
                ONRAMP_PROVIDER.map(async (provider) => {
                    const supported = await provider.checkSupported();
                    return supported ? provider.key : null;
                })
            );

            // NOTE: We don't put the actual provider instances into the cache, because that will fail when persisting.
            // Instead, we use a selector to get the actual provider instances from the keys.
            return supportedProviders.filter(Boolean) as string[];
        },
        {
            select(providerKeys) {
                const providers = providerKeys
                    .map((key) =>
                        ONRAMP_PROVIDER.find((provider) => provider.key === key)
                    )
                    .filter(Boolean) as OnrampProvider[];

                if (!preferredProviderKey) {
                    return providers;
                }

                const preferredProvider = providers.find(
                    ({ key }) => key === preferredProviderKey
                );
                const nonPreferredProviders = providers.filter(
                    ({ key }) => key !== preferredProviderKey
                );

                return [preferredProvider, ...nonPreferredProviders].filter(
                    Boolean
                ) as OnrampProvider[];
            },
        }
    );

    return {
        providers: data,
        setPreferredProvider(key: string) {
            localStorage.setItem(PREFERRED_ONRAMP_PROVIDER_KEY, key);
            setPreferredProviderKey(key);
        },
    };
}
