/* eslint-disable no-unused-vars */

import DetailedImg from "../../../assets/img/art-work/detailed.jpg"
import React, { useEffect, useState } from 'react'
import musicImg from "../../../assets/img/blog-img/music.png";
import AudioPlayer from 'react-h5-audio-player';

const Detailed = (props) => {
  const [imgUrl, setImgUrl] = useState("");


  useEffect(() => {
    if (props.children[1].type === "mp3") {
      setImgUrl(musicImg)
    } else {
      setImgUrl(props.children[1].image)
    }
  }, [props])


  return (
    <div className="col-12 col-lg-5">
      <div className="detailed-img">
        <img src={imgUrl} alt="" />
        {
          props.children[1].type === "mp3" &&
          <AudioPlayer
            src={props.children[1].image}
            onPlay={e => console.log("onPlay")}
          />
        }
      </div>
    </div>
  );
}

export default Detailed;