import "regenerator-runtime/runtime";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Big from "big.js";
import Form from "./components/Form";

const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [usermessage, setMessage] = useState(null);

  useEffect(async () => {
    if (currentUser) {
      const usermessage = await contract.get_message({
        account_id: currentUser.accountId
      });

      setMessage(usermessage);
    }
  });

  const onSubmit = async event => {
    event.preventDefault();

    const { fieldset, message } = event.target.elements;
    fieldset.disabled = true;

    await contract.set_message(
      {
        message: message.value,
        account_id: currentUser.accountId
      },
      BOATLOAD_OF_GAS
    );

    const usermessage = await contract.get_message({
      account_id: currentUser.accountId
    });

    setMessage(usermessage);

    message.value = "";
    fieldset.disabled = false;
    message.focus();
  };

  const signIn = () => {
    wallet.requestSignIn(
      {contractId: nearConfig.contractName, methodNames: ['set_message']},
      "Hello World APP"
    );
  };

  const signOut = () => {
    wallet.signOut();
    window.location.replace(window.location.origin + window.location.pathname);
  };

  return (
    <main>
      <header>
        <h1>Hello World APP</h1>

        {currentUser ?
          <p>Currently signed in as: <code>{currentUser.accountId}</code></p>
        :
          <p>Update or add a usermessage message! Please login to continue.</p>
        }

        { currentUser
          ? <button onClick={signOut}>Log out</button>
          : <button onClick={signIn}>Log in</button>
        }
      </header>

      {currentUser &&
        <Form
          onSubmit={onSubmit}
          currentUser={currentUser}
        />
      }

      {usermessage ?
        <>
          <h1>Hello {usermessage} </h1>
         
        </>
      :
        <p>No usermessage message yet!</p>
      }
    </main>
  );
};

App.propTypes = {
  contract: PropTypes.shape({
    set_message: PropTypes.func.isRequired,
    get_message: PropTypes.func.isRequired
  }).isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired,
  wallet: PropTypes.shape({
    requestSignIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired
  }).isRequired
};

export default App;
