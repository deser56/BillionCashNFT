/* eslint-disable no-unused-vars */

import { cartActions } from "./reducers";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { DeFiWeb3Connector } from "deficonnect";
import WalletConnectProvider from "@walletconnect/web3-provider";

export const update = () => {
  const manualWeb3BscTestNet = new Web3(new Web3.providers.HttpProvider('https://data-seed-prebsc-1-s1.binance.org:8545'))
  let deficonnector = new DeFiWeb3Connector({
    supportedChainIds: [1, 97, 56],
    rpc: {
      1: 'https://mainnet.infura.io/v3/17e978710e44440cadf40a13e0ebeaff',
      56: 'https://bscscan.com',
      97: "https://data-seed-prebsc-1-s1.binance.org:8545",
      1287: "https://rpc.api.moonbase.moonbeam.network",
      1285: "https://rpc.api.moonriver.moonbeam.network"
    },
    pollingInterval: 15000,
  })

  const mobileWalletProvider = new WalletConnectProvider({
    rpc: {
      1: "https://mainnet.infura.io/v3/47b829e7e62f4ccfa9fe9dbd1bde1714",
      97: "https://data-seed-prebsc-1-s1.binance.org:8545",
      1287: "https://rpc.api.moonbase.moonbeam.network",
      1285: "https://rpc.api.moonriver.moonbeam.network"
      // ...
    },
  });
  return async (dispatch) => {
    const provider = await detectEthereumProvider();
    const defiProvider = await deficonnector.getProvider();
    if (provider) {
      const eb3 = new Web3(provider);
      dispatch(cartActions.web(eb3));
      dispatch(cartActions.provider(provider));
      window.ethereum
        .request({
          method: "eth_accounts",
        })
        .then((accounts) => {
          const addr = accounts.length <= 0 ? "" : accounts[0];
          if (accounts.length > 0) {
            dispatch(cartActions.account(addr));
            eb3.eth.getBalance(accounts[0]).then((amount) => {
              dispatch(cartActions.balance(amount));
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (defiProvider) {
      const eb3 = new Web3(defiProvider);
      dispatch(cartActions.web(eb3));
      dispatch(cartActions.provider(defiProvider));
      window.ethereum
        .request({
          method: "eth_accounts",
        })
        .then((accounts) => {
          const addr = accounts.length <= 0 ? "" : accounts[0];
          if (accounts.length > 0) {
            dispatch(cartActions.account(addr));
            eb3.eth.getBalance(accounts[0]).then((amount) => {
              dispatch(cartActions.balance(amount));
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (mobileWalletProvider) {
      const eb3 = new Web3(mobileWalletProvider);
      dispatch(cartActions.web(eb3));
      dispatch(cartActions.provider(mobileWalletProvider));
      window.ethereum
        .request({
          method: "eth_accounts",
        })
        .then((accounts) => {
          const addr = accounts.length <= 0 ? "" : accounts[0];
          if (accounts.length > 0) {
            dispatch(cartActions.account(addr));
            eb3.eth.getBalance(accounts[0]).then((amount) => {
              dispatch(cartActions.balance(amount));
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      dispatch(cartActions.web(manualWeb3BscTestNet));
      dispatch(cartActions.provider(manualWeb3BscTestNet));
    }
  };
};

////////////////////=<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>

export const connectMetamask = () => {
  return async (dispatch) => {
    // Runs only they are brand new, or have hit the disconnect button
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [
        {
          eth_accounts: {}
        }
      ]
    });
    const provider = await detectEthereumProvider();
    if (provider) {
      if (!window.ethereum.selectedAddress) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      }
      await window.ethereum.enable();
      let currentAddress = window.ethereum.selectedAddress;

      const eb3 = new Web3(provider);
      let amount = await eb3.eth.getBalance(currentAddress);
      amount = eb3.utils.fromWei(eb3.utils.toBN(amount), "ether");
      dispatch(
        cartActions.connect({
          web3: eb3,
          account: currentAddress,
          balance: amount,
          wallettype: "MetaMask",
          provider: provider
        })
      );
    } else {
      console.log("Please install MetaMask!");
    }
  };
};
////////////////////=<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>
//DEFI WALLET FUNCTION
export const connectDefi = () => {
  return async (dispatch) => {
    const connector = new DeFiWeb3Connector({
      supportedChainIds: [1, 97],
      rpc: {
        1: "https://mainnet.infura.io/v3/17e978710e44440cadf40a13e0ebeaff",
        97: "https://data-seed-prebsc-1-s1.binance.org:8545",
        1287: "https://rpc.api.moonbase.moonbeam.network",
        1285: "https://rpc.api.moonriver.moonbeam.network"
      },
      pollingInterval: 15000,
    });
    await connector.activate();
    const provider = await connector.getProvider();
    const eb3 = new Web3(provider);
    const address = (await eb3.eth.getAccounts())[0];
    let amount = await eb3.eth.getBalance(address);

    amount = eb3.utils.fromWei(eb3.utils.toBN(amount), "ether");
    dispatch(
      cartActions.connect({
        web3: eb3,
        account: address,
        wallettype: "Defi Wallet",
        balance: amount,
        provider: provider
      })
    );
  };
};

///////////////
//THis mobile connect that can connect mobile
/**
 * 
 * @returns 
 * Do u use 
 */
export const walletConnect = () => {
  return async (dispatch) => {
    const mobileWalletProvider = new WalletConnectProvider({
      rpc: {
        1: "https://mainnet.infura.io/v3/47b829e7e62f4ccfa9fe9dbd1bde1714",
        97: "https://data-seed-prebsc-1-s1.binance.org:8545",
        1287: "https://rpc.api.moonbase.moonbeam.network",
        1285: "https://rpc.api.moonriver.moonbeam.network"
        // ...
      },
    });
    await mobileWalletProvider.enable();
    //Need Fix At Mobile
    const eb3 = new Web3(mobileWalletProvider);
    const currentAddress = (await eb3.eth.getAccounts())[0];
    let amount = await eb3.eth.getBalance(currentAddress);
    amount = eb3.utils.fromWei(eb3.utils.toBN(amount), "ether");
    dispatch(
      cartActions.connect({
        web3: eb3,
        account: currentAddress,
        balance: amount,
        wallettype: "Wallet Connect",
        provider: mobileWalletProvider
      })
    );
  };
}

export const disconnect = () => {
  return async (dispatch) => {
    dispatch(cartActions.disconnect());
  };
};

