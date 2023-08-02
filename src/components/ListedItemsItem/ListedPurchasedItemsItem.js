import { NavLink } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import React from 'react'
import { AppContext } from "../../context/AppContext";
import musicImg from "../../assets/img/blog-img/music.png";
import AudioPlayer from 'react-h5-audio-player';

const ListedPurchasedItemsItem = (props) => {
  const isSold = props.children.sold
  const [newPrice, setNewPrice] = useState(0)
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
          <span><span className="g-text">Royalties:</span> {props.children.royalty}  % <span className="g-text ml-15"></span></span>
          <NavLink to={`/profile/${props.children.creator}`}><h4 className="pricing text-truncate g-text">Creator : {props.children.creator}  </h4> </NavLink>
          <div className="admire">
            {!isSold ? <div className="col-12 text-center">
              <button onClick={props.children.buy} className="more-btn mb-15" >Buy Now</button>
            </div> : ""}

            {/* Create Resell input */}
            <div style={{ width: "-webkit-fill-available" }}>
              <div className="group text-center">
                <input type="number" name="price" id="price" required
                  placeholder="set new item price in BC"
                  onChange={e => setNewPrice(e.target.value)}

                />
                <span className="highlight"></span>
                <span className="sm bar"></span>
              </div>

              <div className="col-12 text-center ">
                {
                  newPrice ? <button disabled={!newPrice} onClick={() => { props.children.resell(props.children.item, newPrice.toString()) }} className="more-btn mb-15" >Resell Item</button>
                    : <button className="more-btn  mb-15 disabled" disabled aria-disabled="true">Set Your Price</button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListedPurchasedItemsItem
