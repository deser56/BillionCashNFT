import { NavLink } from "react-router-dom";
import React from 'react';
import { useSelector } from "react-redux";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import musicImg from "../../assets/img/blog-img/music.png";
import AudioPlayer from 'react-h5-audio-player';

const ListedItemsItem = (props) => {
  const isSold = props.children.sold;
  const [isOwner, setOwner] = useState(false);
  const web = useSelector((state) => state.cart.web3);
  const [account, setAccount] = useState(null);
  const [imgUrl, setImgUrl] = useState("");
  const { themeMode } =
    useContext(AppContext);

  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await web.eth.getAccounts();
      setAccount(accounts[0])
    }
    web && loadAccount();
    // eslint-disable-next-line
  }, [web])

  useEffect(() => {
    if (props.children.seller === account) {
      setOwner(true);
    } else {
      setOwner(false);
    }
    // eslint-disable-next-line
  }, [account])

  useEffect(() => {
    if (props.children.type === "mp3") {
      setImgUrl(musicImg);
    } else {
      setImgUrl(props.children.image)
    }
  }, [props])
  return (
    <div className="col-lg-3 col-sm-6 col-xs-12">
      <div className={`${themeMode ? "light" : "dark"} pricing-item`}>
        <div className="wraper">
          <NavLink to={`/itemdetails/${props.children.itemId}`}><img src={imgUrl} alt="imageNft" /></NavLink>
          {
            props.children.type === "mp3" &&
            <AudioPlayer
              src={props.children.image}
              onPlay={e => console.log("onPlay")}
            />
          }
          <NavLink to={`/itemdetails/${props.children.itemId}`}><h4>{props.children.title}</h4></NavLink>
          <span><span className="g-text">Price:</span> {props.children.price}  BC <span className="g-text ml-15"></span></span>
          <span><span className="g-text">Royalties:</span> {props.children.royalty}  % <span className="g-text ml-15"></span></span>
          <NavLink to={`/profile/${props.children.creator}`}><h4 className="pricing text-truncate g-text">Creator : {props.children.creator}  </h4> </NavLink>
          <NavLink to={`/profile/${props.children.seller}`}><h4 className="pricing text-truncate g-text">Seller : {props.children.seller}  </h4> </NavLink>

          <div className="admire">
            {isSold || isOwner ? <></> :
              <div className="col-12 text-center">
                <button onClick={props.children.buy} className="more-btn mb-15" >{props.children.buttonTitle}</button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListedItemsItem