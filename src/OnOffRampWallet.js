import "./styles.css";
import {
  convertToValidUserId,
  useConnector,
  useCreateFun,
  configureNewFunStore,
  MetamaskConnector,
  Goerli,
} from "@fun-xyz/react";
import { useState, useEffect } from "react";
import { ethers } from "ethers"
import Modal from "react-modal";
import { Token } from "@fun-xyz/core";

const tokens = ["ETH", "USDC", "stETH"]


//Step 1: Initialize the FunStore. This action configures your environment based on your apikey, chain, and the authentication methods of your choosing. 
const DEFAULT_FUN_WALLET_CONFIG = {
  apiKey: "hnHevQR0y394nBprGrvNx4HgoZHUwMet5mXTOBhf",
  chain: Goerli,
  gasSponsor: {
    sponsorAddress: "0xCB5D0b4569A39C217c243a436AC3feEe5dFeb9Ad", //Gasless payments on Goerli. Please switch to another gas sponsor method, or prefund your wallet on mainnet!
  }
};

const DEFAULT_CONNECTORS = [
  MetamaskConnector(),
];

configureNewFunStore({
  config: DEFAULT_FUN_WALLET_CONFIG,
  connectors: DEFAULT_CONNECTORS,
});

//Step 2: Use the connector button to connect your authentication method, in this case metamask. 
const ConnectorButton = ({ index }) => {
  const { active, activate, deactivate, connectorName, connector } = useConnector({ index });

  return (<button
    onClick={() => {
      if (active) {
        deactivate(connector)
        return
      }
      activate(connector)
    }
    }>{active ? ("Unconnect") : ("Connect")} {connectorName} </button>)
}


export default function App() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [url, setUrl] = useState("")
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState({})

  const { account: connectorAccount, active } = useConnector({ index: 0, autoConnect: true });

  //Step 3: Use the initializeFunAccount method to create your funWallet object
  const { account, initializeFunAccount, funWallet } = useCreateFun()

  const initializeSingleAuthFunAccount = async () => {
    if (!connectorAccount) {
      alert("Metamask not connected. Please follow the steps.")
      return
    }

    initializeFunAccount({
      users: [{ userId: convertToValidUserId(connectorAccount) }],
      index: 1234512345 //random number
    }).catch()
  }

  //Step 4: Call onRamp/offRamp using the funWallet object
  const onRamp = async () => {
    if (!funWallet) {
      alert("FunWallet not initialized. Please follow the steps.")
      return
    }
    const url = await funWallet.onRamp()
    setUrl(url)
    setLoading(true)
    openModal()
  }

  const offRamp = async () => {
    if (!funWallet) {
      alert("FunWallet not initialized. Please follow the steps.")
      return
    }

    const url = await funWallet.offRamp()
    setUrl(url)
    openModal()
  }

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setLoading(false)
    
  };

  useEffect(() => {
    const getBalance = async () => {
      if (funWallet) {
        const walletAddr = await funWallet.getAddress()
        let out = { ...balance }
        await Promise.all(tokens.map(async (token) => {
          out[token] = await Token.getBalance(token, walletAddr)
        }))
        setBalance(out)
      }
    }
    getBalance()
  }, [modalIsOpen, funWallet])

  return (
    <div className="App">
      <h1>Onramp and OffRamp Funds to FunWallet</h1>
      1.&ensp;
      <ConnectorButton key={0} index={0} ></ConnectorButton>
      {
        active ?
          <div>
            Success! Metamask Connected!
          </div>
          : <></>
      }
      <br></br>
      <br></br>

      2.&ensp;
      <button onClick={initializeSingleAuthFunAccount}>Initialize FunWallet</button>
      {account ?
        <div>
          Success! FunWallet Address: {account}
        </div>
        : <></>
      }
      <br></br>
      <br></br>

      3.&ensp;
      <button onClick={onRamp} >OnRamp FunWallet</button> &ensp;
      <button onClick={offRamp} >OffRamp FunWallet</button>
      {loading ?
        <div>
          Loading...
        </div>
        : <></>
      }
      <br></br>
      {funWallet && <>Wallet balance: {tokens.map(token => (<div key={token}>&emsp;{balance[token] ?? 0} {token} < br /></div>))}  </>}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div id="modalContent" className="modal-content">
          <iframe
            id="moonpayIframe"
            src={url ? url : ""}
            title="MoonPay"
          ></iframe>
        </div>
      </Modal>
      <br></br>
      <br></br>
    </div>

  );
}