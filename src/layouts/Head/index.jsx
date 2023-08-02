/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { BsSun } from "react-icons/bs";
import { BsFillMoonStarsFill } from "react-icons/bs";

import "jquery-syotimer";
import detectEthereumProvider from '@metamask/detect-provider'
import { DeFiWeb3Connector } from 'deficonnect'
import { Modal } from 'react-bootstrap'


// import './script.js'
import './navbar.css'
import { NavbarLogo, ConnectWalletIconsw1, ConnectWalletIconsw2, ConnectWalletIconsw3 } from '../../utils/allImgs'
import { Addshrink } from '../../utils'
import Preloader from '../../components/Preloader'
import { useWeb3 } from '../../components/web3'
import Web3 from "web3"

import WalletAlert from "../../components/WalletAlert";
import { Provider } from "react-redux";
import Store from "../../store/index";
import { useDispatch, useSelector } from "react-redux";
import { connectMetamask, connectDefi, disconnect, walletConnect } from "../../store/actions";
import { cartActions } from "../../store/reducers";
import { useCookies } from 'react-cookie';
import { AppContext } from "../../context/AppContext";

import searchIcon from "../../assets/img/icons/searchicon.svg"

function Head({ Title }) {

  useEffect(() => {

    Addshrink()
    // eslint-disable-next-line
  }, [window.pageYOffset])
  const [cookies, setCookie] = useCookies(["user"]);

  const account = useSelector((state) => state.cart.account)
  const web = useSelector((state) => state.cart.web3)
  const wallettype = useSelector((state) => state.cart.wallettype);

  const dispatch = useDispatch();
  //////////////////////////////////////////////////////////////////////
  const maskhandler = async () => {
    await dispatch(connectMetamask())
    handleClose();
  }

  if (wallettype === "MetaMask") {
    console.log("I am in with metamask.");
    setCookie("type", 1, { path: '/' });
  }

  const defihandler = async () => {
    await dispatch(connectDefi());
    handleClose();
  }
  if (wallettype === "Defi Wallet") {
    setCookie("type", 2, { path: '/' });
  }

  const connectEtherhandler = async () => {
    await dispatch(walletConnect())
    handleClose();
  }

  if (wallettype === "Wallet Connect") {
    setCookie("type", 3, { path: '/' });
  }

  const disconnecthandler = async () => {
    await dispatch(disconnect())
  }
  if (wallettype === '') {
    setCookie("type", 0, { path: '/' });
  }



  useEffect(() => {
    detectEthereumProvider().then((provider) => {
      if (provider) {
        const eb3 = new Web3(provider);
        dispatch(cartActions.web(eb3));
        dispatch(cartActions.provider(provider));
        window.ethereum.request({
          method: 'eth_accounts'
        }).then((accounts) => {
          const addr = (accounts.length <= 0) ? '' : accounts[0];
          if (accounts.length > 0) {
            dispatch(cartActions.account(addr));
            eb3.eth.getBalance(accounts[0]).then((amount) => {
              dispatch(cartActions.balance(amount));
            });
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    }).catch((err) => {
      console.log(err);
    });
  }, [])

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [showDisconnect, setShowDisconnect] = useState(false);

  const handleCloseDisconnect = () => setShowDisconnect(false);
  const handleShowDisconnect = () => setShowDisconnect(true);

  const handleBuyToken = () => {
    window.open("https://app.sushi.com/swap?chainId=1285&inputCurrency=BNB&outputCurrency=0x8b02349907B605734C0694CA67C41D057c9D8895", '_blank');
  }

  const { themeMode, setThemeMode,searchValue, setSearchValue } =
    useContext(AppContext);

  const handleThemeChange = () => {
    let value = !themeMode;
    localStorage.setItem('themeMode', value);
    setThemeMode(value);
  }

  const handleSearchChange = (event) => {
    let value = event.target.value;
    setSearchValue(value);
  }

  return (
    <>
      <Preloader Title={Title} />
      <nav className="navbar navbar-expand-lg navbar-white fixed-top" id="banner">
        <div className="container">
          <div className="row ">
            <NavLink className="navbar-brand" to="/">
              <span><img style={{ width: 50 }} src={NavbarLogo} alt="logo" /></span>
            </NavLink>
            <NavLink className="navbar-brand text-secondary d-flex" to="/">BC NFT Marketplace</NavLink>

          </div>
          <div
            style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}
          >
            <div className="mobile-searchbar" style={{ width: '80%', margin: 0 }}>
              <input
                type="text"
                className="search-bar"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="search your NFT"
                style={{ paddingLeft: '35px', width: '100%' }}
              />
              <img src={searchIcon} alt="icon"
                style={{
                  position: 'absolute',
                  top: '4px', left: '4px', zIndex: 5
                }}
              />
            </div>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavbar">
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className="collapse navbar-collapse" id="collapsibleNavbar" style={{ width: '80%' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <ul className="navbar-nav">

                <li className="nav-item ">
                  <button className="nav-link text-secondary" onClick={handleBuyToken} style={{ border: "none", background: 'transparent' }}>Buy&nbsp;BC&nbsp;Token</button>
                </li>
                <li className="nav-item ">
                  <NavLink className="nav-link text-secondary" to="/createitem">CreateNFT</NavLink>
                </li>
                <li className="nav-item ">
                  <NavLink className="nav-link text-secondary" to="/Discover">Collections</NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link text-secondary " to="/purchased">Purchased</NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link text-secondary" to="/profile">Profile</NavLink>
                </li>

              </ul>
              <div
                className="desk-searchbar"
                style={{ position: 'relative', width: '80%', margin: 'auto' }}
              >
                <input
                  type="text"
                  className="search-bar"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder="search your NFT"
                  style={{ paddingLeft: '35px', width: '100%' }}
                />
                <img src={searchIcon} alt="icon"
                  style={{
                    position: 'absolute',
                    top: '4px', left: '4px', zIndex: 5
                  }}
                />
              </div>
            </div>
            {
              account ?
                <>
                  <button
                    className="btn login-btn ml-50"
                    onClick={handleShowDisconnect}
                    style={{ width: "-webkit-fill-available", padding: 0 }}
                  >
                    {account.toString()}
                  </button>

                  <Modal show={showDisconnect} onHide={handleCloseDisconnect}>
                    <Modal.Header closeButton>
                      <Modal.Title style={{ marginInlineStart: "auto" }}>Are You Sure To Disconnect</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <button
                        className="btn d-flex align-items-center login-btn  mb-2"
                        style={{ width: "-webkit-fill-available", height: "auto", justifyContent: 'center' }} onClick={disconnecthandler}
                      >
                        Disconnect WAllet
                      </button>

                    </Modal.Body>
                  </Modal>
                </>
                : <button className="btn login-btn ml-50" onClick={handleShow}> Connect Wallet</button>
            }
            <Modal
              size="md"
              aria-labelledby="contained-modal-title-vcenter"
              centered
              show={show}
              onHide={handleClose}
            >
              <Modal.Header
                closeButton
              >
                <Modal.Title style={{ marginInlineStart: "auto" }}>Select Your Wallet</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <button
                  className="btn d-flex align-items-center login-btn  mb-2"
                  style={{ width: "-webkit-fill-available", height: "auto", justifyContent: 'space-between' }}
                  onClick={maskhandler}
                >
                  MetaMask
                  <img className="m-10" src={ConnectWalletIconsw1} alt="wallet" />
                </button>
                <button
                  className="btn d-flex align-items-center login-btn  mb-2"
                  style={{ width: "-webkit-fill-available", height: "auto", justifyContent: 'space-between' }}
                  onClick={defihandler}
                >
                  Defi Wallet
                  <img className="m-10" src={ConnectWalletIconsw3} alt="wallet" />
                </button>
                <button
                  className="btn d-flex align-items-center login-btn  mb-2"
                  style={{ width: "-webkit-fill-available", height: "auto", justifyContent: 'space-between' }}
                  onClick={connectEtherhandler}
                >
                  Wallet Connect
                  <img className="m-10" src={ConnectWalletIconsw2} alt="wallet" />
                </button>
              </Modal.Body>
            </Modal>
            <button className="btn theme-btn ml-3" onClick={handleThemeChange}>
              {
                !themeMode ?
                  <BsSun className="sun-svg" />
                  :
                  <BsFillMoonStarsFill className="sun-svg" />
              }
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Head