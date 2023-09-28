import "./styles.css";
import {
  convertToValidUserId,
  useConnector,
  useCreateFun,
  configureNewFunStore,
  MetamaskConnector,
  Goerli,
} from "@funkit/react";
import { useState, useCallback } from "react";
import { Token } from "@funkit/core";

// ✨✨ Step 1: Initialize the FunStore. This action configures your environment based on your apikey, chain, and the authentication methods of your choosing.
// This should be at the entrypoint of the app, but we are keeping it here with everything else for this demo
const DEFAULT_FUN_WALLET_CONFIG = {
  apiKey: "hnHevQR0y394nBprGrvNx4HgoZHUwMet5mXTOBhf",
  chain: Goerli,
  gasSponsor: {
    sponsorAddress: "0xCB5D0b4569A39C217c243a436AC3feEe5dFeb9Ad", //Gasless payments on Goerli. Please switch to another gas sponsor method, or prefund your wallet on mainnet!
  },
};

const DEFAULT_CONNECTORS = [MetamaskConnector()];

configureNewFunStore({
  config: DEFAULT_FUN_WALLET_CONFIG,
  connectors: DEFAULT_CONNECTORS,
});

export const tokens = ["ETH", "USDC", "stETH"];

const useFunDemo = () => {
  // 🦊🦊 Step 2: Use the connector button to connect your authentication method, in this case we are using metamask
  const {
    active: connectionIsActive,
    activate,
    deactivate,
    connectorName,
    connector,
    account: connectorAccount,
  } = useConnector({ index: 0 });

  const toggleConnect = useCallback(async () => {
    if (connectionIsActive) {
      await deactivate(connector);
    } else {
      await activate(connector);
    }
  }, [connectionIsActive, activate, deactivate, connector]);

  // 💰💰 Step 3: Use the initializeFunAccount method to create your funWallet object
  const { account, initializeFunAccount, funWallet } = useCreateFun();

  const initializeSingleAuthFunAccount = useCallback(async () => {
    if (!connectorAccount) {
      alert("Metamask not connected. Please follow the steps.");
      return;
    }

    await initializeFunAccount({
      users: [{ userId: convertToValidUserId(connectorAccount) }],
      index: parseInt(Math.random() * 10000000), //random number
    }).catch();
  }, [connectorAccount, initializeFunAccount]);

  // 🏁🏁 Step 4: Call onRamp/offRamp using the funWallet object
  const [moonpayUrl, setMoonpayUrl] = useState("");
  const [balance, setBalance] = useState({});

  const onRamp = useCallback(async () => {
    if (!funWallet) {
      alert("FunWallet not initialized. Please follow the steps.");
      return;
    }
    const onrampUrl = await funWallet.onRamp();
    setMoonpayUrl(onrampUrl);
    console.log(onrampUrl);
  }, [funWallet, setMoonpayUrl]);

  const offRamp = useCallback(async () => {
    if (!funWallet) {
      alert("FunWallet not initialized. Please follow the steps.");
      return;
    }
    const offRampUrl = await funWallet.offRamp();
    setMoonpayUrl(offRampUrl);
  }, [funWallet, setMoonpayUrl]);

  // Setup complete! Below is just for UI purposes

  const updateBalance = useCallback(async () => {
    if (funWallet) {
      const walletAddr = await funWallet.getAddress();
      let out = { ...balance };
      await Promise.all(
        tokens.map(async (token) => {
          out[token] = await Token.getBalance(token, walletAddr);
        })
      );
      setBalance(out);
    }
  }, [funWallet, balance, setBalance]);

  return {
    toggleConnect,
    initializeSingleAuthFunAccount,
    onRamp,
    offRamp,
    funWallet,
    connectionIsActive,
    connectorName,
    connector,
    account,
    moonpayUrl,
    balance,
    updateBalance,
  };
};

export default useFunDemo;
