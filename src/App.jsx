/* eslint-disable no-unused-vars */
import React, { useEffect, useContext } from "react";
import Aos from 'aos'
import {
  CreateItem,
  Discover,
  Home,
  ItemDetails,
  Profile
} from './pages'
import Purchased from "./pages/Purchased";
import ProfileAsViewer from "./pages/ProfileAsViewer";
import 'aos/dist/aos.css';
import './assets/css/bootstrap.min.css';
import './assets/css/global.css';
import './assets/css/mediaStyle.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import { Switch, Route } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux"
import { update } from "./store/actions";
import { cartActions } from "./store/reducers";
import { useCookies } from 'react-cookie';

import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { DeFiWeb3Connector } from "deficonnect";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { AppContext } from "../src/context/AppContext";

const App = () => {
  const { themeMode, setThemeMode } =
  useContext(AppContext);
  const web = useSelector((state) => state.cart.web3)
  const dispatch = useDispatch()
  const [cookies, setCookie] = useCookies(["user"]);

  useEffect(() => {
    if (cookies.type === null)
      setCookie("type", -1, { path: '/' });
    if (web === null && (cookies.type === -1 || cookies.type !== 0))
      dispatch(update())
    dispatch(cartActions.balance(0))
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    Aos.init({
      duration: 1000
    })
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    var currentTheme = localStorage.getItem('themeMode');
    if (currentTheme === "false") {
      setThemeMode(false);
    } else {
      setThemeMode(true);
    }
    // eslint-disable-next-line
  },[])



  const providerChanged = (provider) => {
    provider.on("accountsChanged", _ => window.location.reload());
    provider.on("chainChanged", _ => window.location.reload());

  }
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

  //problrem with connector

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      const defiProvider = await deficonnector.getProvider();
      if (provider) {
        providerChanged(provider);
      } else if (defiProvider) {
        providerChanged(defiProvider);
      } else if (mobileWalletProvider) {
        providerChanged(mobileWalletProvider);
      } 
    }
    loadProvider()
    // eslint-disable-next-line
  }, [])


  return (
    <div className= {`App ${themeMode ? "light-body" : "dark-body"}`}>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/createitem" component={CreateItem} />
        <Route path="/discover" component={Discover} />
        <Route path="/itemDetails/:itemId" component={ItemDetails} />
        <Route path="/profile/:creatorId" component={ProfileAsViewer} />
        <Route path="/profile" component={Profile} />
        <Route path="/purchased" component={Purchased} />
      </Switch>
    </div>
  );
}

export default App;