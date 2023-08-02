/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import InfoComponent from '../../components/InfoComponent'
import ListedPurchasedItemsItem from '../../components/ListedItemsItem/ListedPurchasedItemsItem'
import ListedResellPurchasedItemsItem from '../../components/ListedItemsItem/ListedResellPurchasedItemsItem'
import '../../components/ListedItems'
import Web3 from "web3"
import axios from 'axios'
import detectEthereumProvider from '@metamask/detect-provider'
import Head from "../../layouts/Head";
import { useHistory } from "react-router-dom";
import Preloader from '../../components/Preloader';
import { useSelector } from "react-redux";

const Purchased = () => {
  const [isLoading, setIsloading] = useState(true)
  const account = useSelector((state) => state.cart.account)
  const web = useSelector((state) => state.cart.web3)

  //Load Contracts Function
  const [nftContract, setNFtContract] = useState(null)
  const [marketContract, setMarketContract] = useState(null)
  const [nftAddress, setNFtAddress] = useState(null)
  const [marketAddress, setMarketAddress] = useState(null)
  const [purchasedItems, setpurchasedItems] = useState([])
  const [newPrice, setNewPrice] = useState(0)
  const [resellItems, setResellItems] = useState([])

  const history = useHistory();
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
      if (nftNetWorkObject && nftMarketWorkObject) {
        const nftAddress = nftNetWorkObject.address;
        setNFtAddress(nftAddress)
        const marketAddress = nftMarketWorkObject.address;
        setMarketAddress(marketAddress)
        const deployedNftContract = await new web.eth.Contract(nFTAbi, nftAddress);
        setNFtContract(deployedNftContract)
        const deployedMarketContract = await new web.eth.Contract(markrtAbi, marketAddress);
        setMarketContract(deployedMarketContract)
        //Fetch all unsold items
        if (account) {
          try {
            const data = await deployedMarketContract.methods.getMyNFTPurchased().call({ from: account })
            const items = await Promise.all(data.map(async item => {
              const nftUrl = await deployedNftContract.methods.tokenURI(item.tokenId).call();
              const priceToWei = Web3.utils.fromWei((item.price).toString(), "ether")
              const metaData = await axios.get(nftUrl);
              let myItem = {
                price: priceToWei,
                itemId: item.tokenId,
                owner: item.owner,
                seller: item.seller,
                oldOwner: item.oldOwner,
                creator: item.creator,
                oldSeller: item.oldSeller,
                sold: item.sold,
                royalty: item.royalty,
                oldPrice: item.oldPrice,
                image: metaData.data.image,
                name: metaData.data.name,
                type: metaData.data.type,
                category: metaData.data.category,
                description: metaData.data.description,
                isResell: item.isResell,
              }
              return myItem;
            }));
            setpurchasedItems(items);
            setIsloading(false)
          } catch (e) {
            console.error(e)
          }
        }
        //Fetch my item i Publish  it as resell
        const myResellItemsResult = await deployedMarketContract.methods.getMyResellItems().call({ from: account })
        const resellItems = await Promise.all(myResellItemsResult.map(async item => {
          const nftUrl = await deployedNftContract.methods.tokenURI(item.tokenId).call();
          const priceToWei = Web3.utils.fromWei((item.price).toString(), "ether")
          const metaData = await axios.get(nftUrl);
          let myItem = {
            price: priceToWei,
            itemId: item.tokenId,
            owner: item.owner,
            seller: item.seller,
            oldOwner: item.oldOwner,
            creator: item.creator,
            oldSeller: item.oldSeller,
            sold: item.sold,
            royalty: item.royalty,
            oldPrice: item.oldPrice,
            image: metaData.data.image,
            name: metaData.data.name,
            type: metaData.data.type,
            description: metaData.data.description,
            category: metaData.data.category,
            isResell: item.isResell,
          }
          return myItem;
        }))

        setResellItems(resellItems)
        setIsloading(false)

      } else {
        window.alert("You are at Wrong Network, Connect with BSC network Please")
      }
    }
    web && LoadContracts()
    // eslint-disable-next-line
  }, [account])

  const resellItemFunction = async (item, newPrice) => {
    if (marketContract) {
      const priceToWei = Web3.utils.toWei(newPrice, "ether")
      if (account) {
        const lanchTheNFtForSale = await marketContract.methods.putItemToResell(nftAddress, item.itemId, priceToWei).send({ from: account });

        if (lanchTheNFtForSale) {
          window.location.reload();
        }

      } else {
        window.alert(" UNlock Your Wallet Or Please install any provider wallet like MetaMask")
      }
    }
  }

  const cancelResellNFT = async (nftItem) => {
    const convertIdtoInt = Number(nftItem.itemId)
    if (account) {
      try {
        const result = await marketContract.methods.cancelResellWitholdPrice(nftAddress, convertIdtoInt).send({ from: account })
        if (result) {
          window.location.reload();
        }
      } catch (e) {
        console.log(e)
      }
    }

  }

  return (
    <div className="pt-5" style={{ minHeight: '100vh' }}>
      <Head />
      <br />
      {isLoading ? <Preloader Title={"loading ... "} /> : <section className="features section-padding-0-100 " style={{ marginTop: '50px' }}>
        <div className="container pt-5">
          <InfoComponent
            className="pt-5" titleSm='Discover Your Purchased Item'
          />
          <div className="row align-items-center">
            {
              purchasedItems < 1 ? < InfoComponent className="container pt-5"
                titleSm='You dont Purchased Item Yet'
              /> : purchasedItems.map((item, i) => (
                <ListedPurchasedItemsItem  key={i}>
                  {{
                    item: item,
                    image: item.image,
                    title: item.name,
                    price: item.price,
                    type: item.type,
                    royalty: item.royalty,
                    creator: item.creator,
                    itemId: item.itemId,
                    sold: item.sold,
                    resell: resellItemFunction
                  }}
                </ListedPurchasedItemsItem>
              ))}
          </div>
        </div>
      </section>}
      <br />
      {isLoading ? <Preloader Title={"loading ...."} /> : <section className="features section-padding-0-100 ">
        <div className="container pt-5">
          <InfoComponent
            className="pt-5" titleSm='Discover Your Resell Items'
          />
          <div className="row align-items-center">
            {
              resellItems < 1 ? < InfoComponent className="container pt-5"
                titleSm='You dont Have Resell Item Yet'
              /> : resellItems.map((item, i) => (
                <ListedResellPurchasedItemsItem key={i}>
                  {{
                    item: item,
                    image: item.image,
                    title: item.name,
                    price: item.price,
                    royalty: item.royalty,
                    type: item.type,
                    creator: item.creator,
                    itemId: item.itemId,
                    sold: item.sold,
                    cancelResell: cancelResellNFT
                  }}
                </ListedResellPurchasedItemsItem>
              ))}
          </div>
        </div>
      </section>}
    </div>
  )
}

export default Purchased;