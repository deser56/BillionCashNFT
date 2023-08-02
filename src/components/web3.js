/* eslint-disable no-unused-vars */

import Web3 from "web3"
import React from 'react'

import detectEthereumProvider from '@metamask/detect-provider'
import { DeFiWeb3Connector } from 'deficonnect'

const { createContext, useContext, useState, useEffect, useMemo } = require("react");
const Web3Context = createContext(null);

export default function Web3Provider({ children }) {

  const [web3Api, setWe3Api] = useState({
    provider: null,
    web3: null,
    account: null,
    isLoading: false
  })

  const providerChanged = (provider) => {
    provider.on("accountsChanged", _ => window.location.reload());
    provider.on("chainChanged", _ => window.location.reload());

  }
  let connector = new DeFiWeb3Connector({
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

  //problrem with connector


  useEffect(() => {
    detectEthereumProvider().then((provider) => {
      if (provider) {
        setWe3Api({ provider: provider });
        window.ethereum.request({
          method: 'eth_accounts'
        }).then((accounts) => {
          const addr = (accounts.length <= 0) ? '' : accounts[0];
          if (accounts.length > 0) {
            setWe3Api({ account: addr });
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    }).catch((err) => {
      console.log(err);
    });
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      await connector.activate();
      const defiProvider = await connector.getProvider();
      console.log("defiProvider", defiProvider)

      if (provider) {
        // await connector.activate()
        providerChanged(provider);
        setWe3Api({
          provider,
          web3: new Web3(provider),
          isLoading: true
        })
      } else if (connector) {

        providerChanged(defiProvider);
        setWe3Api({
          provider: defiProvider,
          web3: new Web3(defiProvider),
          isLoading: true
        })
      } else {
        setWe3Api(api => ({ ...api, isLoading: true }))
        window.alert("connect wallet mobile view")
      }

    }

    loadProvider()
    // eslint-disable-next-line
  }, [])
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async function (accounts) {
        if (web3Api.web3) {
          console.log("load");
          // setAccounts(accounts[0]);   
          // setAddress(accounts[0]);
          setWe3Api({ account: accounts[0] });

          let amount = await web3Api.web3.eth.getBalance(accounts[0]);
        }
      });
    }
    // eslint-disable-next-line
  }, [web3Api.web3])

  //connectDefiWallet Function
  //  const connectDefiWallet = async () => {

  //     await connector.activate();
  //     const provider = await connector.getProvider();
  //     const web3 = new Web3(provider);
  //     const address = (await web3.eth.getAccounts())[0];
  //     let amount = await web3.eth.getBalance(address);
  //     amount = web3.utils.fromWei(web3.utils.toBN(amount), "ether");

  //     console.log("OK from Defi Wallet Connector")

  //   }

  const _web3Api = useMemo(() => {
    return {
      ...web3Api,
      // metaMaskConnect:web3Api.provider? async()=>{
      //     try{
      //         await web3Api.provider.request({methods:"eth_requestAccounts"})
      //     }catch(e){
      //     console.log("iam in error from metaMaskConnect")
      //         window.reload()
      //     }
      // }:()=>{
      //     console.error("Cannot connect with meta mask, try to reload your browser")
      // },
    }
    // eslint-disable-next-line
  }, [web3Api])
  //Create LoadAccounts Function


  useEffect(() => {
    const loadAccount = async () => {
      try {
        console.log("web3Api", web3Api)
        const accounts = await web3Api.web3.eth.getAccounts();
        const address = (await web3Api.web3.eth.getAccounts())[0];
        console.log("loadAccount", address)
        setWe3Api(api => ({ ...api, account: address }))
      } catch (e) {
        console.log(e)
      }
    }
    web3Api.web3 && loadAccount();
    // eslint-disable-next-line
  }, [web3Api.web3])


  return (
    <Web3Context.Provider value={_web3Api}>
      {children}
    </Web3Context.Provider>
  )


}
export function useWeb3() {
  return useContext(Web3Context)
}