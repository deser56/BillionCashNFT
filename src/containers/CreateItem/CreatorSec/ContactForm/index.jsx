/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import Web3 from "web3"
import React, { useState, useEffect, useContext } from 'react'
import { create } from 'ipfs-http-client'
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import { AppContext } from "../../../../context/AppContext.js";
import musicImg from "../../../../assets/img/blog-img/music.png"


const ipfsClient = create("https://ipfs.infura.io:5001/api/v0");

const ContactForm = () => {
	const { themeMode } =
		useContext(AppContext);

	const account = useSelector((state) => state.cart.account)
	const web = useSelector((state) => state.cart.web3)

	const history = useHistory();
	const [buttonTitle, setButtonTitle] = useState("Please Fill All Fields")

	//Load Contracts Function
	const [nftContract, setNFtContract] = useState(null)
	const [marketContract, setMarketContract] = useState(null)
	const [isActive, setIsActive] = useState(false)
	const [urlHash, setUrlHash] = useState("")
	const [imgUrl, setImgUrl] = useState("")

	const [name, setName] = useState("");
	const [description, setDesc] = useState("");
	const [price, setPrice] = useState(0);
	const [royalty, setRoyalty] = useState("none");
	const [category, setCategory] = useState("none");
	const [type, setType] = useState("");

	const onChange = async (e) => {
		const file = e.target.files[0];
		try {
			const addedFile = await ipfsClient.add(file);
			const ipfsUrl = `https://ipfs.infura.io/ipfs/${addedFile.path}`;
			if (file.type.indexOf('image') !== -1) {
				setUrlHash(ipfsUrl)
				setImgUrl(ipfsUrl);
				setType("image");
			} else {
				setUrlHash(ipfsUrl);
				setImgUrl(musicImg);
				setType("mp3")
			}
		} catch (e) {
			console.log(e)
		}
	}

	const createMarketItem = async () => {

		if (price <= 0 || !name || !description || category === "none" || royalty === "none" || !urlHash || !type) return;
		setButtonTitle("Please wait...")
		const data = JSON.stringify({
			name: name, description: description, royalty: royalty, category: category, image: urlHash, type: type
		});

		try {
			setIsActive(false)
			const addedFile = await ipfsClient.add(data);
			const ipfsUrl = `https://ipfs.infura.io/ipfs/${addedFile.path}`;
			createMarketForSale(ipfsUrl);
		} catch (e) {
			console.log(e)
		}
	}

	useEffect(() => {
		if (price <= 0 || !name || !description || category === "none" || royalty === "none" || !urlHash || !type) {
			setIsActive(false)
		} else {
			setIsActive(true)
		}
	}, [price, name, description, category, royalty, urlHash, type])

	const [tokenContract, setTokenContract] = useState(null)
	const [tokenBalance, setTokenBalnce] = useState("0");

	useEffect(() => {
		const LoadContracts = async () => {
			//Paths of Json File
			const netWorkId = await web.eth.net.getId();
			//Get Token Contract
			const TokenContractFile = await fetch("/abis/Token.json");
			const convertTokenContractFileToJson = await TokenContractFile.json();
			const tokenAbi = await convertTokenContractFileToJson.abi;
			const TokenMarketWorkObject = convertTokenContractFileToJson.networks[netWorkId];

			if (TokenMarketWorkObject) {
				const tokenAddress = TokenMarketWorkObject.address;
				const deployedTokenContract = await new web.eth.Contract(tokenAbi, tokenAddress);
				setTokenContract(deployedTokenContract);
				if (account) {
					const getTokenBalance = await deployedTokenContract.methods.balanceOf(account).call();
					const tokenPriceToWei = Web3.utils.fromWei(getTokenBalance, "ether")
					setTokenBalnce(tokenPriceToWei.toString());
				}

			} else {
				window.alert("You are at Wrong Network, Connect with BSC network Please")
			}
		}
		web && account && LoadContracts()

	}, [web && account])



	const createMarketForSale = async (url) => {
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

		if (nftMarketWorkObject && nftMarketWorkObject) {
			const nftAddress = nftNetWorkObject.address;
			const marketAddress = nftMarketWorkObject.address;

			const deployedNftContract = await new web.eth.Contract(nFTAbi, nftAddress);
			setNFtContract(deployedNftContract)
			const deployedMarketContract = await new web.eth.Contract(markrtAbi, marketAddress);
			setMarketContract(deployedMarketContract)

			if (account) {
				//Start to create NFt Item Token To MarketPlace
				let createTokenResult = await deployedNftContract.methods.createNFtToken(url).send({ from: account })
				const tokenid = createTokenResult.events.Transfer.returnValues["2"]
				setIsActive(false)
				setButtonTitle("Please wait...")
				let marketFees = await deployedMarketContract.methods.gettheMarketFees().call()
				marketFees = marketFees.toString()
				const priceToWei = Web3.utils.toWei(price, "ether")
				const royalties = parseInt(royalty);
				try {
					const lanchTheNFtForSale = await deployedMarketContract.methods.createItemForSale(nftAddress, tokenid, priceToWei, royalties).send({ from: account, value: marketFees })
					setButtonTitle("Please wait...")

					if (lanchTheNFtForSale) {
						history.push("/purchased");
					}
				} catch (err) {
					setIsActive(false)
					setButtonTitle(buttonTitle)
				}
			} else {
				window.alert(" UNlock Your Wallet Or Please install any provider wallet like MetaMask")
			}
		} else {
			window.alert("You are at Wrong Netweok, Connect with BSC Please")
		}
	}
	return (
		<>
			<div className="contact_form">
				<div className="row">
					<div className="col-12">
						<div id="success_fail_info"></div>
					</div>

					<div className="col-12 col-md-12">
						<p className="w-text">Upload Item File</p>
						<div className="group-file">
							{
								urlHash ? <img src={imgUrl} alt="placeholder " /> : <img width="200" src="./upload.png" alt="freepik" />
							}
							<div>
								<p className="g-text">File type: PNG,JPG,JPEG,GIF,MP3</p>

								<input className="new_Btn more-btn form-contro" onChange={onChange} type="file" style={{ maxWidth: '400px', width: "-webkit-fill-available" }} />
							</div>
						</div>
					</div>
					<div className="col-12 col-md-12">
						<div className="group">
							<input className="" type="text" name="name" id="name" required
								placeholder="Item name"
								onChange={e => setName(e.target.value)}
							/>
							<span className="highlight"></span>
							<span className="bar"></span>
						</div>
					</div>
					<div className="col-12 col-md-12">

					</div>
					<div className="col-12">
						<div className="group">
							<textarea name="Description" id="Description" required
								placeholder="Item Description"
								onChange={e => setDesc(e.target.value)}
							/>

							<span className="highlight"></span>
							<span className="bar"></span>

						</div>
					</div>


					<div className="col-12 col-md-12">
						<div className="group">
							<input type="number" name="price" id="price" required
								placeholder="Item Price in BC 999.00"
								onChange={e => setPrice(e.target.value)}
							/>
							<span className="highlight"></span>
							<span className="bar"></span>
						</div>
					</div>

					<div>
						<select
							className="form-select mb-4"
							placeholder="Set Royalty(%)"
							aria-label="Select Single Category"
							onChange={e => setRoyalty(e.target.value)}
						>
							<option value={"none"}>Set Royalty(%)</option>
							{Array(10).fill(0).map((item, index) => <option key={index} value={index + 1}>{index + 1}%</option>)}
						</select>
					</div>
					<div>
						<select
							className="form-select"
							aria-label="Select Single Category"
							onChange={e => setCategory(e.target.value)}
						>
							<option value="none">Select NFT Category</option>
							<option value="art">ART</option>
							<option value="collectibles">COLLECTIBLES</option>
							<option value="photography">PHOTOGRAPHY</option>
							<option value="sport">SPORT</option>
							<option value="tradingcards">TRADING CARDS</option>
							<option value="utility">UTILITY</option>
							<option value="virtualworlds">VIRTUAL WORLDS</option>
						</select>
					</div>
					<div className="col-12 text-center pt-5">
						{
							isActive ? <button className="more-btn mb-15 " onClick={createMarketItem}>Create NFT</button> : <button className={`btn ${themeMode ? "text-danger" : "text-warning"} mb-15 `} >{buttonTitle}</button>
						}
					</div>
				</div>
			</div>
		</>
	);
}

export default ContactForm;