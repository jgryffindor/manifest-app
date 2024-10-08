import { WalletSection } from "@/components";
import DenomInfo from "@/components/factory/components/DenomInfo";
import MyDenoms from "@/components/factory/components/MyDenoms";
import {
  useBalance,
  useGroupsByAdmin,
  usePoaParams,
  useTokenBalances,
  useTokenFactoryBalance,
  useTokenFactoryDenoms,
  useTokenFactoryDenomsMetadata,
} from "@/hooks";
import { MetadataSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";
import { useChain } from "@cosmos-kit/react";

import Head from "next/head";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";

import { chainName } from "@/config";
import MetaBox from "@/components/factory/components/metaBox";
import { CoinSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/base/v1beta1/coin";

export default function Factory() {
  const MFX_TOKEN_DATA: MetadataSDKType = {
    description: "The native token of the Manifest Chain",
    denom_units: [
      { denom: "umfx", exponent: 0, aliases: [] },
      { denom: "mfx", exponent: 6, aliases: [] },
    ],
    base: "umfx",
    display: "mfx",
    name: "Manifest",
    symbol: "MFX",
    uri: "",
    uri_hash: "",
  };

  const { address, isWalletConnected } = useChain(chainName);
  const { denoms, isDenomsLoading, isDenomsError, refetchDenoms } =
    useTokenFactoryDenoms(address ?? "");
  const { metadatas, isMetadatasLoading, isMetadatasError, refetchMetadatas } =
    useTokenFactoryDenomsMetadata();

  const [selectedDenom, setSelectedDenom] = useState<string | null>(null);
  const [selectedDenomMetadata, setSelectedDenomMetadata] =
    useState<MetadataSDKType | null>(null);

  const [balance, setBalance] = useState<CoinSDKType | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const {
    balance: fetchedBalance,
    refetchBalance,
    isBalanceLoading: isFetchingBalance,
  } = useTokenFactoryBalance(address ?? "", selectedDenomMetadata?.base ?? "");

  useEffect(() => {
    if (selectedDenomMetadata) {
      setIsBalanceLoading(true);
      refetchBalance().then(() => {
        setIsBalanceLoading(false);
      });
    }
  }, [selectedDenomMetadata, refetchBalance]);

  useEffect(() => {
    if (fetchedBalance) {
      setBalance(fetchedBalance);
    }
  }, [fetchedBalance]);

  // Combine denoms and metadatas
  const combinedData = useMemo(() => {
    let result: MetadataSDKType[] = [MFX_TOKEN_DATA];

    if (denoms && metadatas) {
      const tokenFactoryDenoms = denoms.denoms
        .map((denom: string) => {
          return (
            metadatas.metadatas.find((meta) => meta.base === denom) || null
          );
        })
        .filter(
          (meta: MetadataSDKType | null) => meta !== null,
        ) as MetadataSDKType[];

      result = [...result, ...tokenFactoryDenoms];
    }

    return result;
  }, [denoms, metadatas]);

  const handleDenomSelect = (denom: MetadataSDKType) => {
    setSelectedDenom(denom.base);
    setSelectedDenomMetadata(denom);
  };

  const refetch = async () => {
    refetchDenoms();
    refetchMetadatas();

    if (selectedDenomMetadata) {
      refetchBalance();
    }
  };

  return (
    <>
      <div className="max-w-5xl relative py-8 mx-auto lg:mx-auto">
        <div className="flex items-center justify-between flex-wrap -ml-4 -mt-2 sm:flex-nowrap">
          <div className="ml-4 mt-2">
            <h3 className="tracking-tight leading-none text-4xl xl:text-4xl md:block hidden">
              Factory
            </h3>
            <h3 className="tracking-tight px-4 leading-none text-4xl xl:text-4xl md:hidden block">
              Factory
            </h3>
          </div>
          {isWalletConnected && (
            <Link href="/factory/create" passHref>
              <button className="relative items-center btn btn-primary hidden md:inline-flex">
                Create New Token
              </button>
            </Link>
          )}
        </div>
        <div className="mt-6 p-4 gap-4 flex flex-col lg:flex-row md:flex-col sm:flex-col xs:flex-col rounded-md bg-base-300 shadow-lg transition-opacity duration-300 ease-in-out animate-fadeIn">
          {!isWalletConnected ? (
            <section className="transition-opacity duration-300 ease-in-out animate-fadeIn w-full">
              <div className="grid max-w-screen-xl bg-base-100 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
                <div className="mr-auto place-self-center lg:col-span-7">
                  <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl">
                    Connect your wallet!
                  </h1>
                  <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                    Use the button below to connect your wallet and start
                    minting tokens.
                  </p>
                  <WalletSection chainName="manifest" />
                </div>
                <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
                  <img src="/factory.svg" alt="factory" className="h-60 w-60" />
                </div>
              </div>
            </section>
          ) : (
            isWalletConnected &&
            denoms &&
            metadatas && (
              <div className="flex flex-col w-full">
                <div className="flex flex-col lg:flex-row md:flex-col sm:flex-col xs:flex-col w-full gap-4 transition-opacity duration-300 ease-in-out animate-fadeIn">
                  <div className="lg:w-1/3 md:w-full">
                    <MyDenoms
                      denoms={combinedData}
                      isLoading={isDenomsLoading || isMetadatasLoading}
                      isError={isDenomsError || isMetadatasError}
                      refetchDenoms={refetchDenoms}
                      onSelectDenom={handleDenomSelect}
                    />
                  </div>
                  <div className="lg:w-2/3 md:w-full">
                    <DenomInfo
                      balance={balance}
                      isBalanceLoading={isBalanceLoading}
                      denom={selectedDenomMetadata}
                      address={address ?? ""}
                      refetchDenoms={refetchDenoms}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <MetaBox
                    balance={balance?.amount ?? ""}
                    refetch={refetch}
                    address={address ?? ""}
                    denom={selectedDenomMetadata}
                  />
                </div>
                {isWalletConnected && (
                  <Link href="/factory/create" passHref>
                    <button className="relative items-center btn btn-primary block md:hidden w-full mt-6 mb-2">
                      Create New Token
                    </button>
                  </Link>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
