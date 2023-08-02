/* eslint-disable no-unused-vars */

import { NavLink } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import InfoComponent from '../InfoComponent'
import ListedItemsItem from '../ListedItemsItem'
import './listedItems.css'
import Web3 from "web3"
import axios from 'axios'
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import Preloader from '../../components/Preloader'

function ListedItemsContainer() {
  const account = useSelector((state) => state.cart.account)
  const web = useSelector((state) => state.cart.web3)
  const [isLoading, setIsloading] = useState(false)
  const [buyButtonTitle, setBuyButtonTitle] = useState("Loading ...")
  const history = useHistory();
  //Create LoadAccounts Function
  const [accountBalance, setAccountBalance] = useState(0);
  //Load Contracts Function
  const [nftContract, setNFtContract] = useState(null)
  const [marketContract, setMarketContract] = useState(null)
  const [nftAddress, setNFtAddress] = useState(null)
  const [marketAddress, setMarketAddress] = useState(null)
  const [unsoldItems, setUnsoldItems] = useState([])
  const [tokenContract, setTokenContract] = useState(null)
  const [tokenBalance, setTokenBalnce] = useState("0");
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
      const nftNetWorkObject = convertNftContratFileToJson.networks[netWorkId];
      const nftMarketWorkObject = convertMarketContractFileToJson.networks[netWorkId];

      if (nftNetWorkObject && nftMarketWorkObject && account != null) {
        setBuyButtonTitle("Buy Now")
      } else {
        setBuyButtonTitle("Wrong Network")
      }


      //Get Token Contract
      const TokenContractFile = await fetch("/abis/Token.json");
      const convertTokenContractFileToJson = await TokenContractFile.json();
      const tokenAbi = await convertTokenContractFileToJson.abi;

      const TokenMarketWorkObject = convertTokenContractFileToJson.networks[netWorkId];

      if (nftMarketWorkObject && nftMarketWorkObject && TokenMarketWorkObject) {
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
        if (account) {
          const myBalance = await web.eth.getBalance(account)
          const convertBalance = await web.utils.fromWei(myBalance, "ether")
          setAccountBalance(convertBalance)
          const getTokenBalance = await deployedTokenContractWithWallet.methods.balanceOf(account).call();
          const tokenPriceToWei = Web3.utils.fromWei(getTokenBalance, "ether")
          setTokenBalnce(tokenPriceToWei.toString());
        }
        //Fetch all unsold items
        const data = await deployedMarketContractWithWallet.methods.getAllUnsoldItems().call()
        const items = await Promise.all(data.map(async item => {
          const nftUrl = await deployedNftContractWithWallet.methods.tokenURI(item.tokenId).call();
          const priceToWei = Web3.utils.fromWei((item.price).toString(), "ether")
          const metaData = await axios.get(nftUrl);

          //TODO: fix this object
          let myItem = {
            price: priceToWei,
            itemId: item.id,
            owner: item.owner,
            seller: item.seller,
            oldOwner: item.oldOwner,
            creator: item.creator,
            admin: item.admin,
            oldSeller: item.oldSeller,
            royalty: item.royalty,
            oldPrice: item.oldPrice,
            image: metaData.data.image,
            type: metaData.data.type,
            name: metaData.data.name,
            description: metaData.data.description,
            isResell: item.isResell,
          }
          return myItem;
        }))

        setUnsoldItems(items)
        setIsloading(false)

      } else {
        window.alert("You are at Wrong Network, Connect with BSC network Please")
      }
    }
    web && LoadContracts()
    // eslint-disable-next-line
  }, [web, account])
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

  return (
    <>
      {
        isLoading ? <Preloader Title={"loading ..... "} /> : <section className="features section-padding-0-100 ">
          <div className="container">
            <InfoComponent
              titleSm='Discover New NFTs'
              titleLg='New Listed Items'
              text='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.'
            />
            <div className="row align-items-center">
              {unsoldItems.map((item, i) => (
                <ListedItemsItem key={i}>
                  {{
                    buttonTitle: buyButtonTitle,
                    itemId: item.itemId,
                    image: item.image,
                    title: item.name,
                    price: item.price,
                    type: item.type,
                    royalty: item.royalty,
                    creator: item.creator,
                    buy: async () => {
                      buyNFT(item);
                    }
                  }}
                </ListedItemsItem>
              ))}
              <div className="col-12 col-lg-12 text-center">
                <NavLink className="btn more-btn" to="/discover">Load More</NavLink>
              </div>
            </div>
          </div>
        </section>
      }
    </>
  )
}

export default ListedItemsContainer