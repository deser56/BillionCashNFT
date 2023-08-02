import { NavLink } from "react-router-dom";
import React from 'react'
import { useState, useEffect } from "react";
import musicImg from "../../assets/img/blog-img/music.png";
import AudioPlayer from 'react-h5-audio-player';

function TopCollectionsItem({ img, title, text, itemId, type }) {
  const [imgUrl, setImgUrl] = useState("")

  useEffect(() => {
    if (type === "mp3") {
      setImgUrl(musicImg)
    } else {
      setImgUrl(img);
    }
    // eslint-disable-next-line
  }, [type])
  return (
    <div className="col-12 col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay='200'>
      <div className="collection_icon">
        <NavLink to={`/itemdetails/${itemId}`}><img src={imgUrl} alt="imageNft" /></NavLink>
        {
          type === "mp3" &&
          <AudioPlayer
            src={img}
            onPlay={e => console.log("onPlay")}
          />
        }
      </div>
      <div className="collection_info">
        <h5 className="text-bold">{title}</h5>
        <NavLink to={`/profile/${text}`}><h6 className="pricing text-truncate text-primary"> Creator : {text}  </h6> </NavLink>
      </div>
    </div>
  )
}

export default TopCollectionsItem