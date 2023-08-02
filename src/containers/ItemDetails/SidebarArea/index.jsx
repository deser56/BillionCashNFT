/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";


const SidebarArea = (props) => {
  const isSold = props.children.sold
  const [isOwner, setOwner] = useState(false);
  const web=useSelector((state)=>state.cart.web3)
  //Create LoadAccounts Function
  const [account, setAccount] = useState(null);
  const [categoryname, setCategory] = useState("");


  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await web.eth.getAccounts();
      setAccount(accounts[0])
    }
    web && loadAccount();
    // eslint-disable-next-line
  }, [web])


  useEffect(() => {
    if (props.children.seller === account){
      setOwner(true);
    } else {
      setOwner(false);
    }
    // eslint-disable-next-line
  },[account])

  useEffect(() => {
    if(props.children.category.length>0){
      switch (props.children.category) {
        case "art":
          setCategory("ART");
          break;
        case "collectibles":
          setCategory("COLLECTIBLES");
          break;
        case "photography":
          setCategory("PHOTOGRAPHY");
          break;
        case "sport":
          setCategory("SPORT");
          break;
        case "tradingcards":
          setCategory("TRADING CARDS");
          break;
        case "utility":
          setCategory("UTILITY");
          break;
        case "virtualworlds":
          setCategory("VIRTUAL WORLDS");
          break;
      
        default:
          break;
      }
    }
  },[props.children.category])

  return (
    <div className="col-12 col-lg-4 mt-s">
      <div className="sidebar-area">
        <div className="donnot-miss-widget">
          <div className="who-we-contant">

            <h4>{props.children.title}</h4>
          </div>
          <div className="mb-15 gray-text"><span className="w-text mr-15 gradient-text">Current Price {props.children.price} BC </span></div>
          <div className="mb-15 gray-text"><span className="w-text mr-15 gradient-text">Royalties {props.children.royalty} % </span></div>
          <div className="details-list">
            <p >Artist Creator: <span>{props.children.creator}</span></p>
            <p >Seller: <span>{props.children.seller}</span></p>
            <p >Category: <span>{categoryname}</span></p>
            <span className="gradient-text">Item Description</span>
            <p className="w-text p-3">{props.children.description}</p>
          </div>
          {
            isSold || isOwner ? <></> :
              <button className="open-popup-link more-btn width-100 mt-30" onClick={props.children.buy} >{props.children.buttonTitle}</button>
          }
        </div>
      </div>
    </div>
  );
}

export default SidebarArea;