/* eslint-disable no-unused-vars */

import { NavLink } from "react-router-dom";
import React from "react";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import musicImg from "../../assets/img/blog-img/music.png";
import { useEffect, useState } from "react";
import AudioPlayer from 'react-h5-audio-player';

const ListedResellPurchasedItemsItem = (props) => {
  const { themeMode } =
    useContext(AppContext);
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => {
    if (props.children.type === "mp3") {
      setImgUrl(musicImg);
    } else {
      setImgUrl(props.children.image);
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
          <span><span className="g-text">Royalty:</span> {props.children.royalty}  % <span className="g-text ml-15"></span></span>
          <NavLink to={`/profile/${props.children.creator}`}><h4 className="pricing text-truncate g-text">Creator : {props.children.creator}  </h4> </NavLink>
          <div className="admire">
            <div className="col-12 text-center ">
              {
                <button onClick={() => props.children.cancelResell(props.children.item)} className="more-btn mb-15" >Cancel Resell</button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListedResellPurchasedItemsItem
