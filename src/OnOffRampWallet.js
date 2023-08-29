import "./styles.css";
import {
  convertToValidUserId,
  useConnector,
  useCreateFun,
  configureNewFunStore,
  MetamaskConnector,
  Goerli,
} from "@fun-xyz/react";
import { useState } from "react";
import { ethers } from "ethers"
import Modal from "react-modal";

//Step 1: Initialize the FunStore. This action configures your environment based on your ApiKey, chain, and the authentication methods of your choosing. 
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

  const { account: connectorAccount, active } = useConnector({ index: 0, autoConnect: true });

  //Step 3: Use the initializeFunAccount method to create your funWallet object
  const { account, initializeFunAccount, funWallet } = useCreateFun()

  const initializeSingleAuthFunAccount = async () => {
    initializeFunAccount({
      users: [{ userId: convertToValidUserId(connectorAccount) }],
      index: 1234512345 //random number
    }).catch()
  }

  //Step 4: Call onRamp/offRamp using the funWallet object
  const onRamp = async () => {
    const url = await funWallet.onRamp()
    setUrl(url)
    setLoading(true)
    openModal()
  }

  const offRamp = async () => {
    const url = await funWallet.offRamp()
    setUrl(url)
    openModal()
  }

  const openModal = () => {
    setModalIsOpen(true);
  };

  const getWalletAssets = async () => {
    const assets = await funWallet.getAssets()
    const ethAmount = assets?.tokens["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"].tokenBalance
    const amount = ethers.utils.formatEther(parseInt(ethAmount).toString())
    setAmount(amount)
  }

  const closeModal = () => {
    setModalIsOpen(false);
    setLoading(false)
    getWalletAssets()

  };

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
      {amount ?
        <div>
          Wallet balance: {amount} eth. <a href={`https://goerli.etherscan.io/address/${account}`} target="_blank" >Block Explorer.</a>
        </div>
        : <></>
      }
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