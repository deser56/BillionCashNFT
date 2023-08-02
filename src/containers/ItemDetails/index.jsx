/* eslint-disable no-unused-vars */
import SidebarArea from './SidebarArea'
import React, { useState, useEffect } from "react";
import Web3 from "web3"
import axios from 'axios'
import Detailed from "../ItemDetails/Detailed"

import '../../assets/css/itemDetails.css'
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import Preloader from '../../components/Preloader'

const ItemDetailsContainer = (props) => {
  //1-Fetch signle post Data
  const itemId = props.children.itemId
  const account = useSelector((state) => state.cart.account)
  const web = useSelector((state) => state.cart.web3)
  const history = useHistory();
  const [isLoading, setIsloading] = useState(true)
  const [tokenContract, setTokenContract] = useState(null)
  const [tokenBalance, setTokenBalnce] = useState("0");
  const [buyButtonTitle, setBuyButtonTitle] = useState("Loading ...")
  //Load Contracts Function
  const [nftContract, setNFtContract] = useState(null)
  const [marketContract, setMarketContract] = useState(null)
  const [nftAddress, setNFtAddress] = useState(null)
  const [marketAddress, setMarketAddress] = useState(null)
  const [singleItem, setSingleItem] = useState([])

  useEffect(() => {
    const LoadContracts = async () => {
      //Paths of Json File
      const nftContratFile = await fetch("/abis/NFT.json");
      const marketContractFile = await fetch("/abis/NFTMarketPlace.json");
      //Convert all to json
      const convertNftContratFileToJson = await nftContratFile.json();
      const convertMarketContractFileToJson = await marketContractFile.json();
      //Get The ABI
      const markrtAbi = convertMarketContractFileToJson.abi;
      const nFTAbi = convertNftContratFileToJson.abi;

      const netWorkId = await web.eth.net.getId();
      //Get Token Contract
      const TokenContractFile = await fetch("/abis/Token.json");
      const convertTokenContractFileToJson = await TokenContractFile.json();
      const tokenAbi = await convertTokenContractFileToJson.abi;
    
      const TokenMarketWorkObject = convertTokenContractFileToJson.networks[netWorkId];
      const nftNetWorkObject = convertNftContratFileToJson.networks[netWorkId];
      const nftMarketWorkObject = convertMarketContractFileToJson.networks[netWorkId];

      if (nftNetWorkObject && nftMarketWorkObject && account != null) {
        setBuyButtonTitle("Buy Now")
      } else {
        setBuyButtonTitle("Wrong Network")
      }

      if (nftNetWorkObject && nftMarketWorkObject && TokenMarketWorkObject) {

        const nftAddress = nftNetWorkObject.address;
        setNFtAddress(nftAddress)
        const marketAddress = nftMarketWorkObject.address;
        setMarketAddress(marketAddress)
        const deployedNftContractWithWallet = await new web.eth.Contract(nFTAbi, nftAddress);
        setNFtContract(deployedNftContractWithWallet)
        const deployedMarketContractWithWallet = await new web.eth.Contract(markrtAbi, marketAddress);
        setMarketContract(deployedMarketContractWithWallet)
        const tokenAddress = TokenMarketWorkObject.address;
        const deployedTokenContractWithWallet = await new web.eth.Contract(tokenAbi, tokenAddress);
        setTokenContract(deployedTokenContractWithWallet);

        try {
          if (Number(itemId)) {
            const item = await deployedMarketContractWithWallet.methods.fetchSingleItem(itemId).call()

            if (account) {
              const getTokenBalance = await deployedTokenContractWithWallet.methods.balanceOf(account).call();
              const tokenPriceToWei = Web3.utils.fromWei(getTokenBalance, "ether")
              setTokenBalnce(tokenPriceToWei.toString());
            }
            const nftUrl = await deployedNftContractWithWallet.methods.tokenURI(itemId).call();
            const priceToWei = Web3.utils.fromWei((item.price).toString(), "ether")
            const metaData = await axios.get(nftUrl);
            let myItem = {
              price: priceToWei,
              itemId: item.tokenId,
              owner: item.owner,
              seller: item.seller,
              creator: item.creator,
              admin: item.admin,
              sold: item.sold,
              royalty: item.royalty,
              image: metaData.data.image,
              type: metaData.data.type,
              title: metaData.data.name,
              category: metaData.data.category,
              description: metaData.data.description,
              isResell: item.isResell
            }
            setSingleItem(myItem)
            setIsloading(false)
            return myItem;
          }

        } catch (e) {
          console.log(e)
        }

      } else {
        window.alert("You are at Wrong Network, Connect with BSC network Please")
      }
    }

    web && LoadContracts()
    // eslint-disable-next-line
  }, [web, account])


  const [transactions, setTransaction] = useState([]);

  const loadTransactions = async () => {
    const getTransactions = await nftContract.getPastEvents("Transfer", { fromBlock: 0, toBlock: "latest", filter: { tokenId: itemId } });
    setTransaction(getTransactions)
  }
  //Create nft Buy Function
  const buyNFT = async (nftItem) => {
    const nftPriceToWei = Web3.utils.toWei((nftItem.price).toString(), "ether")
    const convertIdtoInt = Number(nftItem.itemId)
    try {
      if (account && tokenContract) {
        if (nftItem.isResell) {
          let priceinNumber = (Number(nftItem.price));
          try {
            //Calculate The creatorCommission
            let royalty = parseInt(nftItem.royalty)
            const creatorCommission = ((Number(nftItem.price) / 100)) * (royalty);
            const creatorCommissionPriceToWei = Web3.utils.toWei((creatorCommission).toString(), "ether")
            const adminCommission = ((Number(nftItem.price) / 100)) * (5);
            const adminCommissionPriceToWei = Web3.utils.toWei((adminCommission).toString(), "ether")
            let sellerMoney = (priceinNumber - creatorCommission - adminCommission);
            const sellerMoneypriceToWei = Web3.utils.toWei((sellerMoney).toString(), "ether")
            if (creatorCommission) {
              //send the seller price
              const sendNftCommissionToCreator = await tokenContract.methods.transfer(nftItem.creator, creatorCommissionPriceToWei).send({ from: account })
              const sendNFTCommissionToAdmin = await tokenContract.methods.transfer(nftItem.admin, adminCommissionPriceToWei).send({ from: account })
              const sendNftPriceToSeller = await tokenContract.methods.transfer(nftItem.seller, sellerMoneypriceToWei).send({ from: account })
              if (sendNftPriceToSeller) {
                const result = await marketContract.methods.createMarketForSale(nftAddress, convertIdtoInt).send({ from: account})
                if (result){
                  history.push("/purchased");
                }
              }
            }
          } catch (e) {
            console.log("error in catch or nft BUY", e)
          }

        } else {
          try {
            let priceinNumber = (Number(nftItem.price));
            const adminCommission = ((Number(nftItem.price) / 100)) * (5);
            const adminCommissionPriceToWei = Web3.utils.toWei((adminCommission).toString(), "ether")
            let sellerMoney = (priceinNumber  - adminCommission);
            const sellerMoneypriceToWei = Web3.utils.toWei((sellerMoney).toString(), "ether")
            const sendNFTCommissionToAdmin = await tokenContract.methods.transfer(nftItem.admin, adminCommissionPriceToWei).send({ from: account })
            const sendNftPriceToSeller = await tokenContract.methods.transfer(nftItem.seller, sellerMoneypriceToWei).send({ from: account })
            if (sendNftPriceToSeller) {
              const result = await marketContract.methods.createMarketForSale(nftAddress, convertIdtoInt).send({ from: account })
              if (result){
                history.push("/purchased");
              }
            }
          } catch (e) {
            console.log("error else of NFT BUy", e)
          }
        }
      }

    } catch (e) {
      window.alert("You should be in the Cronos Mainnet in Metamask")
    }
  }

  //2-send the data to seperated component with 

  return (
    <>
      {isLoading ? <Preloader Title={"loading Single NFT "} /> : 
      <section className="section-padding-100">
        <div className="container">

          <div className="row p-4 mt-50">
            <Detailed > {{ image: singleItem.image, type: singleItem.type }} </Detailed>
            <SidebarArea>
              {{
                buttonTitle: buyButtonTitle,
                sold: singleItem.sold,
                title: singleItem.title,
                price: singleItem.price,
                royalty: singleItem.royalty,
                creator: singleItem.creator,
                seller: singleItem.seller,
                description: singleItem.description,
                category: singleItem.category,
                buy: async () => buyNFT(singleItem)
              }}
            </SidebarArea>

          </div>
        </div>
      </section>}


    </>
  );
}

export default ItemDetailsContainer;

