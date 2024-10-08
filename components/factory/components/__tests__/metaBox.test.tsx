import { afterEach, describe, expect, test, jest, mock } from "bun:test";
import React from "react";
import { screen, cleanup, waitFor, within } from "@testing-library/react";
import MetaBox from "@/components/factory/components/metaBox";
import matchers from "@testing-library/jest-dom/matchers";
import { renderWithChainProvider } from "@/tests/render";
import { mockDenom, mockMfxDenom } from "@/tests/mock";

expect.extend(matchers);

// Mock usePoaParams and useGroupsByAdmin hooks
mock.module("@/hooks", () => ({
  usePoaParams: jest.fn().mockReturnValue({
    poaParams: { admins: ["mockAdmin"] },
    isPoaParamsLoading: false,
    refetchPoaParams: jest.fn(),
    isPoaParamsError: false,
  }),
  useGroupsByAdmin: jest.fn().mockReturnValue({
    groupByAdmin: {
      groups: [{ members: [{ member: { address: "mockAddress" } }] }],
    },
    isGroupByAdminLoading: false,
    refetchGroupByAdmin: jest.fn(),
  }),
}));

const renderWithProps = (props = {}) => {
  const defaultProps = {
    denom: null,
    address: "test-address",
    refetch: jest.fn(),
    balance: "0",
  };
  return renderWithChainProvider(<MetaBox {...defaultProps} {...props} />);
};

describe("MetaBox", () => {
  afterEach(cleanup);

  test("renders 'Select a token to view options' message when no denom is provided", () => {
    renderWithProps();
    expect(
      screen.getByText("Select a token to view options"),
    ).toBeInTheDocument();
  });

  test("sets active tab to 'mint' for MFX tokens", () => {
    renderWithProps({ denom: mockMfxDenom });
    expect(screen.getByText("Mint MFX")).toBeInTheDocument();
  });

  test("renders loading state correctly", () => {
    renderWithProps({ denom: null, isLoading: true });
    expect(
      screen.getByText("Select a token to view options"),
    ).toBeInTheDocument();
  });

  test("renders TransferForm when active tab is 'transfer'", async () => {
    renderWithProps({ denom: mockDenom });
    const transferTab = screen.getByText("Transfer");
    expect(transferTab).toBeInTheDocument();
    expect(transferTab).toBeEnabled();
    transferTab.click();
    await waitFor(() =>
      expect(screen.getByText("Transfer TEST")).toBeInTheDocument(),
    );
  });

  test("renders BurnForm when active tab is 'burn'", async () => {
    renderWithProps({ denom: mockDenom });
    const burnTab = screen.getByText("Burn");
    expect(burnTab).toBeInTheDocument();
    expect(burnTab).toBeEnabled();
    burnTab.click();
    await waitFor(() =>
      expect(screen.getByText("Burn TEST")).toBeInTheDocument(),
    );
  });

  test("renders MintForm when active tab is 'mint'", async () => {
    renderWithProps({ denom: mockDenom });
    const tabs = screen.getByLabelText("tabs");
    const mintTab = within(tabs).getByText("Mint");
    expect(mintTab).toBeInTheDocument();
    expect(mintTab).toBeEnabled();
    mintTab.click();
    await waitFor(() =>
      expect(screen.getByText("Mint TEST")).toBeInTheDocument(),
    );
  });
});
