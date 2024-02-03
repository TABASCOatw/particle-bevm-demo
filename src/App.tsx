import React, { useState, useEffect } from 'react';
import { useETHProvider, useBTCProvider, useConnectModal } from '@particle-network/btc-connectkit';
import { AAWrapProvider, SendTransactionMode } from '@particle-network/aa';
import { chains } from '@particle-network/chains';
import { ethers } from 'ethers';
import { notification } from 'antd';
import './App.css';

// Frontend component only -- ignore
import NetworkIndicator from './networkIndicator';
// --

const App = () => {
  const { smartAccount, chainId } = useETHProvider();
  const { openConnectModal, disconnect } = useConnectModal();
  const { accounts } = useBTCProvider();

  const [address, setAddress] = useState(null);

  const customProvider = new ethers.providers.Web3Provider(new AAWrapProvider(smartAccount, SendTransactionMode.Gasless), "any");

  useEffect(() => {
    if (accounts.length > 0) {
      const setAddressAsync = async () => {
        const addr = await smartAccount.getAddress();
        setAddress(addr);
      };
      setAddressAsync();
    }
  }, [accounts, smartAccount]);

  const handleLogin = () => {
    if (!accounts.length) {
      openConnectModal();
    }
  };

  const executeTxEvm = async () => {
    const signer = customProvider.getSigner();

    const tx = {
      to: "0x000000000000000000000000000000000000dEaD",
      value: ethers.utils.parseEther('0.0000001'),
      data: "0x"
    };

    const txResponse = await signer.sendTransaction(tx);
    const txReceipt = await txResponse.wait();

    notification.success({
      message: "Transaction Successful",
      description: (
        <div>
          Transaction Hash: <a href={`${chains.getEVMChainInfoById(chainId).blockExplorerUrl}/tx/${txReceipt.transactionHash}`} target="_blank" rel="noopener noreferrer">{txReceipt.transactionHash}</a>
        </div>
      )
    });
  };

  const executeTxEvmSATS = async () => {
    const signer = customProvider.getSigner();

    const tokenContract = new ethers.Contract('0x6e128a3BCfC042D539cae6fe761AB3ef6d0e298c', ["function transfer(address to, uint256 amount)"], signer);

    const txResponse = await tokenContract.transfer('0x000000000000000000000000000000000000dEaD', ethers.utils.parseEther('10'));
    const txReceipt = await txResponse.wait();

    notification.success({
      message: "Transaction Successful",
      description: (
        <div>
          Transaction Hash: <a href={`${chains.getEVMChainInfoById(chainId).blockExplorerUrl}/tx/${txReceipt.transactionHash}`} target="_blank" rel="noopener noreferrer">{txReceipt.transactionHash}</a>
        </div>
      )
    });
  };

  return (
    <div className="App">
      <div className="logo-section">
        <img src="https://i.imgur.com/EerK7MS.png" alt="Logo 1" className="logo logo-big" />

        <img src="https://i.imgur.com/gKtK1Ph.png" alt="Logo 2" className="logo" />
      </div>
      {!address ? (
      <button className="sign-button" onClick={handleLogin}>
        <img src="https://i.imgur.com/aTxNcXk.png" alt="Bitcoin Logo" className="bitcoin-logo" />
        Connect
      </button>
      ) : (
        <div className="profile-card">
          <NetworkIndicator />
          <h5>{address}</h5>
          <h5>{accounts[0]}</h5>
          <button className="sign-message-button" onClick={executeTxEvm}>Execute Transaction (EVM)</button>
          <button className="sign-message-button" onClick={executeTxEvmSATS}>Execute SATS Transaction (EVM)</button>
          <button className="disconnect-button" onClick={() => {disconnect(); setAddress(null)}}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default App;