import React, { useState, useEffect } from "react";
import Modal from "react-modal";

import useFunDemo, { tokens } from "./useFunDemo";

/** This file just renders the UI for this app. Look in useFunDemo.js to see how easy the logic is to set up! */

const ChecklistItems = ({ stepNumber, children }) => {
  return (
    <ul>
      {React.Children.map(children, (child, idx) => {
        const stepTodo = idx >= stepNumber;
        const className =
          stepNumber === idx ? "upNext" : stepNumber > idx ? "done" : "";
        return (
          <li key={idx} className={className}>
            <div className="progressionPath">
              <div className={`stepIndicator ${stepTodo ? "blue" : "green"}`}>
                {stepTodo ? (
                  idx + 1
                ) : (
                  <img src="checkmark.svg" alt="checkmark" />
                )}
              </div>
              {idx < React.Children.count(children) - 1 && (
                <div
                  className={`verticalLine ${stepTodo ? "blue" : "green"}`}
                ></div>
              )}
            </div>
            {child}
          </li>
        );
      })}
    </ul>
  );
};

const AsyncButton = ({ children, onClick, disabled }) => {
  const [loading, setLoading] = useState(false);

  return (
    <button
      className={disabled ? "disabled" : ""}
      onClick={async () => {
        if (disabled) return;
        setLoading(true);
        await onClick();
        setLoading(false);
      }}
    >
      {loading ? <div className="loadingIndicator" /> : children}
    </button>
  );
};

const App = () => {
  const {
    toggleConnect,
    connectionIsActive,
    initializeSingleAuthFunAccount,
    funWallet,
    account,
    onRamp,
    offRamp,
    balance,
    moonpayUrl,
    updateBalance,
  } = useFunDemo();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  useEffect(() => {
    updateBalance();
  }, [modalIsOpen, updateBalance]);

  const [step, setStep] = useState(0);

  return (
    <div>
      <h2>Onramp and Offramp Funds to FunWallet</h2>
      <ChecklistItems stepNumber={step}>
        <div>
          <h3>
            {connectionIsActive ? "Metamask connected!" : "Connect metamask"}
          </h3>
          {connectionIsActive ? (
            <p> You are now ready to use FunWallet </p>
          ) : (
            <AsyncButton
              onClick={async () => {
                await toggleConnect();
                setStep(1);
              }}
            >
              <p>Connect</p>
            </AsyncButton>
          )}
        </div>

        <div>
          <h3>Initialize FunWallet</h3>
          {account ? (
            <p>Success! FunWallet Address: {account}</p>
          ) : (
            <AsyncButton
              disabled={step < 1}
              onClick={async () => {
                await initializeSingleAuthFunAccount();
                setStep(2);
              }}
            >
              <p>Initialize</p>
            </AsyncButton>
          )}
        </div>
        <div>
          <h3> Onramp FunWallet </h3>
          <AsyncButton
            disabled={step < 2}
            onClick={async () => {
              onRamp();
              setModalIsOpen(true);
              await new Promise((resolve) => setTimeout(resolve, 1500));
              setStep(3);
            }}
          >
            <p>Onramp</p>
          </AsyncButton>
        </div>
        <div>
          <h3> Offramp FunWallet </h3>
          <AsyncButton
            disabled={step < 3}
            onClick={async () => {
              offRamp();
              setModalIsOpen(true);
              await new Promise((resolve) => setTimeout(resolve, 1500));
              setStep(4);
            }}
          >
            <p>Offramp</p>
          </AsyncButton>
        </div>
      </ChecklistItems>

      {funWallet && (
        <>
          <h3 style={{ color: "#111" }}>Wallet balance:</h3>
          {tokens.map((token) => (
            <p key={token} style={{ marginBlock: 5 }}>
              {balance[token] ?? 0} {token}
            </p>
          ))}
        </>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div id="modalContent" className="modal-content">
          <iframe
            id="moonpayIframe"
            src={moonpayUrl ? moonpayUrl : ""}
            title="MoonPay"
          ></iframe>
        </div>
      </Modal>
    </div>
  );
};

export default App;
