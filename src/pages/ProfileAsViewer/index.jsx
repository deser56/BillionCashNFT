/* eslint-disable no-unused-vars */
import { NavLink } from "react-router-dom";
import { SortingCard } from '../../utils'
import CollectionItem from '../../containers/Profile/CollectionItem'
import Breadcumb from '../../components/Breadcumb'
import detectEthereumProvider from '@metamask/detect-provider'
import React, { useState, useEffect, useContext } from "react";
import axios from 'axios'
import Web3 from "web3"
import '../../assets/css/profile.css'
import Head from "../../layouts/Head";
import { AppContext } from "../../context/AppContext";

import { useSelector } from "react-redux";
import ProfileItem from "../../containers/Profile/item";
const ProfileAsViewer = (props) => {
	const { themeMode } = useContext(AppContext);
	const [isLoading, setIsLoading] = useState(true);
	const account = useSelector((state) => state.cart.account)
	const web = useSelector((state) => state.cart.web3)
	//Create LoadAccounts Function
	const [accountBalance, setAccountBalance] = useState(0);

	//Load Contracts Function
	const [nftContract, setNFtContract] = useState(null)
	const [marketContract, setMarketContract] = useState(null)
	const [nftAddress, setNFtAddress] = useState(null)
	const [marketAddress, setMarketAddress] = useState(null)

	const [tokenContract, setTokenContract] = useState(null)
	const [tokenBalance, setTokenBalnce] = useState("0");
	const [creatorCommissionValueInwei, setCreatorCommissionValueInwei] = useState(null)

	//Load Contracts Function
	const [creathedItems, setcreathedItems] = useState([])

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

			if (nftNetWorkObject && nftMarketWorkObject && TokenMarketWorkObject) {
				const nftAddress = nftNetWorkObject.address;
				setNFtAddress(nftAddress)
				const marketAddress = nftMarketWorkObject.address;
				setMarketAddress(marketAddress)

				const deployedNftContract = await new web.eth.Contract(nFTAbi, nftAddress);
				setNFtContract(deployedNftContract)
				const deployedMarketContract = await new web.eth.Contract(markrtAbi, marketAddress);
				setMarketContract(deployedMarketContract)

				const tokenAddress = TokenMarketWorkObject.address;
				const deployedTokenContract = await new web.eth.Contract(tokenAbi, tokenAddress);
				setTokenContract(deployedTokenContract);
				if (account) {
					const myBalance = await web.eth.getBalance(account)
					const convertBalance = await web.utils.fromWei(myBalance, "ether")
					setAccountBalance(convertBalance)
					const getTokenBalance = await deployedTokenContract.methods.balanceOf(account).call();
					const tokenPriceToWei = Web3.utils.fromWei(getTokenBalance, "ether")
					setTokenBalnce(tokenPriceToWei.toString());
				}

				if (account) {
					const data = await deployedMarketContract.methods.getMyItemCreated().call({ from: account })
					const items = await Promise.all(data.map(async item => {
						const nftUrl = await deployedNftContract.methods.tokenURI(item.tokenId).call();
						const priceToWei = Web3.utils.fromWei((item.price).toString(), "ether")
						const metaData = await axios.get(nftUrl);
						let classChange;
						if ((item.sold || item.isResell)) {
							classChange = "branding"
						} else {
							classChange = "design"
						}
						//TODO: fix this object
						let myItem = {
							ClassChange: classChange,
							price: priceToWei,
							itemId: item.id,
							owner: item.owner,
							seller: item.seller,
							oldOwner: item.oldOwner,
							royalty: item.royalty,
							creator: item.creator,
							oldSeller: item.oldSeller,
							oldPrice: item.oldPrice,
							image: metaData.data.image,
							type: metaData.data.type,
							title: metaData.data.name,
							description: metaData.data.description,
							isResell: item.isResell,
						}

						return myItem;

					}))

					const mySoldItems = items.filter(item => (item.sold || item.isResell));
					//setSoldItems(mySoldItems)
					setcreathedItems(items)
				}
			} else {
				window.alert("You are at Wrong Network, Connect with BSC network Please")
			}
		}
		setIsLoading(false)
		web && LoadContracts()
		// eslint-disable-next-line
	}, [account])

	useEffect(() => {
		creathedItems?.length > 0 && setTimeout(() => SortingCard(), 2000)
	}, [creathedItems])

	const [category, SetCategory] = useState('all')

	const handleClick = (event) => {
		let value = event.target.name;
		SetCategory(value);
	}

	return (
		<>
			<Head />
			<Breadcumb
				namePage='USER ADDRESS'
				title={account}
			/>
			{
				isLoading ? "Loading" : <section className="blog-area section-padding-100">
					<div className="container">

						<div className="row">

							<CollectionItem />

							<div className="col-12 col-md-9">

								<div className="dream-projects-menu mb-50">
									<div className="text-center portfolio-menu">
										<button
											name="all"
											onClick={handleClick}
											className={`btn mr-2 ${category === "all" ? "filter-active" : ""} ${themeMode ? "light-color" : "dark-color"}`}
											data-filter="*"
										>
											All
										</button>
										<button
											name="sold"
											onClick={handleClick}
											className={`btn  mr-2  ${category === "sold" ? "filter-active" : ""}  ${themeMode ? "light-color" : "dark-color"}`}
											data-filter=".branding"
										>
											Sold
										</button>
										<button
											name="created"
											onClick={handleClick}
											className={`btn  mr-2  ${category === "created" ? "filter-active" : ""}  ${themeMode ? "light-color" : "dark-color"}`}
											data-filter=".design"
										>
											Created
										</button>
									</div>
								</div>
								<div className="row">
									<div className="container">
										<div className="row dream-portfolio" data-aos="fade-up">
											{creathedItems && creathedItems.map((item, i) => (
												<ProfileItem
													key={i}
													ClassChange={item.ClassChange}
													itemId={item.itemId}
													image={item.image}
													title={item.title}
													price={item.price}
													royalty={item.royalty}
													creator={item.creator}
													type={item.type}
												/>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			}
			<br />

		</>
	);
}

export default ProfileAsViewer;