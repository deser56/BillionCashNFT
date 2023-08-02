/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import {
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter
} from 'mdb-react-ui-kit';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import detectEthereumProvider from "@metamask/detect-provider";
import { DeFiWeb3Connector } from 'deficonnect'
import Web3 from "web3";
import { useWeb3 } from './web3'


const WalletAlert = () => {
    const [centredModal, setCentredModal] = useState(false);
    const [walletType, setWalletType] = useState("");
    const web3Api = useWeb3();
    const toggleShow = () => setCentredModal(!centredModal);
    return (
        <div className='App'>
            <header>
                <div >
                    <div className='mask' >
                        <div className='d-flex justify-content-center align-items-center h-100'>
                            <div className='text-white'>
                                <button className='btn login-btn ml-50' onClick={toggleShow}>
                                    Connect Wallet
                                </button><br /><br />
                                {
                                    web3Api.account &&
                                    <>
                                        <h3>Address: {web3Api.account}</h3>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <MDBModal tabIndex='-1' show={centredModal} setShow={setCentredModal}>
                    <MDBModalDialog centered>
                        <MDBModalContent>
                            <MDBModalHeader className="modalheader">
                                <MDBModalTitle>Connect Wallet</MDBModalTitle>
                                <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
                            </MDBModalHeader>
                            {
                                !web3Api.account ?
                                    <MDBModalBody>
                                        <div className="row">
                                            <div className="col-sm-6 mb-4">
                                                <img className="walleticon" src="icon/metamask.png" alt="" />
                                                <button type="button" className="btn btn-outline-primary" data-mdb-ripple-color="dark" >MetaMask</button>
                                            </div>

                                            <div className="col-sm-6 mb-4">
                                                <img className="walleticon" src="icon/defi.png" alt="" />
                                                <button type="button" className="btn btn-outline-primary" data-mdb-ripple-color="dark" >Defiwallet</button>
                                            </div>
                                        </div>
                                    </MDBModalBody> :
                                    <div>
                                        <MDBModalBody>
                                            <h5>You are currently connected to <strong>{web3Api.account}</strong> via <strong>{walletType}</strong></h5>
                                        </MDBModalBody>
                                        <MDBModalFooter>
                                            <MDBBtn color='secondary' onClick={toggleShow}>
                                                Close
                                            </MDBBtn>
                                            <MDBBtn >Disconnect</MDBBtn>
                                        </MDBModalFooter>
                                    </div>
                            }
                        </MDBModalContent>
                    </MDBModalDialog>
                </MDBModal>
            </header>
        </div>
    );
}

export default WalletAlert;