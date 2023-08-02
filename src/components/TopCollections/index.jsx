/* eslint-disable no-unused-vars */
import React from 'react'
import { useState, useEffect, useContext } from "react";
import TopCollectionsItem from '../TopCollectionsItem'
import InfoComponent from '../InfoComponent'
import Web3 from "web3"
import axios from 'axios'
import { useSelector } from "react-redux";
import Preloader from '../../components/Preloader'
import { AppContext } from "../../context/AppContext";

function TopCollectionsContainer() {
  //Craete function to listen the change in account changed and network changes
  const account = useSelector((state) => state.cart.account)
  const web = useSelector((state) => state.cart.web3)
  const { themeMode, searchValue } =
    useContext(AppContext);

  const [isLoading, setIsloading] = useState(false)

  //Load Contracts Function
  const [nftContract, setNFtContract] = useState(null)
  const [marketContract, setMarketContract] = useState(null)
  const [nftAddress, setNFtAddress] = useState(null)
  const [marketAddress, setMarketAddress] = useState(null)
  const [unsoldItems, setUnsoldItems] = useState([])
  const [filtItems, setFilterdItems] = useState([]);

  const [tokenContract, setTokenContract] = useState(null)
  const [tokenBalance, setTokenBalnce] = useState("0");
  const indexOfunsold = unsoldItems.length;

  const firstOne = unsoldItems[indexOfunsold - 1]
  const seconsOne = unsoldItems[indexOfunsold - 2]
  const thirdOne = unsoldItems[indexOfunsold - 3]
  const fourthOne = unsoldItems[indexOfunsold - 4]

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
            tokenId: item.tokenId,
            owner: item.owner,
            seller: item.seller,
            oldOwner: item.oldOwner,
            royalty: item.royalty,
            creator: item.creator,
            oldSeller: item.oldSeller,
            oldPrice: item.oldPrice,
            image: metaData.data.image,
            name: metaData.data.name,
            type: metaData.data.type,
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
  }, [account])
  //Create nft Buy Function

  useEffect(() => {
    if (unsoldItems.length > 0) {
      setFilterdItems(unsoldItems);
    }
  }, [unsoldItems])

  useEffect(() => {
    if (searchValue.length > 0) {
      let filterdItems = unsoldItems.filter((item) => item.name.includes(searchValue));

      setFilterdItems(filterdItems);
    } else {
      setFilterdItems(unsoldItems);
    }
    // eslint-disable-next-line
  }, [searchValue])

  return (
    <>
      {
        isLoading ? <Preloader Title={"loading Top 4 "} /> : <section className="section-padding-100 clearfix" >
          <div className="container">
            <InfoComponent
              titleSm='Our Top New NFTs'
              titleLg='Buy, sell, and discover exclusive digital assets'
            // text='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.'
            />
            <div className="row">
              <div className="container col-md-9">
                {
                  searchValue.length > 0 ?
                    <>
                      {filtItems?.map((item, i) =>
                        <TopCollectionsItem
                          key={i}
                          img={item.image}
                          type={item.type}
                          title={item.name}
                          text={item.seller}
                          itemId={item.tokenId}
                        />
                      )}
                    </> :
                    <>
                      {
                        (unsoldItems.length < 3)
                          ?
                          <>
                            {filtItems?.map((item, i) =>
                              <TopCollectionsItem
                                key={i}
                                img={item.image}
                                title={item.name}
                                type={item.type}
                                text={item.seller}
                                itemId={item.tokenId}
                              />
                            )}
                          </>
                          :
                          <>
                            <div className="row">
                              <TopCollectionsItem
                                img={firstOne.image}
                                title={firstOne.name}
                                text={firstOne.seller}
                                type={firstOne.type}
                                itemId={firstOne.tokenId}
                              />
                              <TopCollectionsItem
                                img={seconsOne.image}
                                title={seconsOne.name}
                                text={seconsOne.seller}
                                type={seconsOne.type}
                                itemId={seconsOne.tokenId}
                              />
                              <TopCollectionsItem
                                img={thirdOne.image}
                                title={thirdOne.name}
                                text={thirdOne.seller}
                                type={thirdOne.type}
                                itemId={thirdOne.tokenId}

                              />
                            </div>
                          </>
                      }
                    </>
                }


              </div>


            </div>

          </div>
        </section>
      }
    </>
  )
}

export default TopCollectionsContainer

