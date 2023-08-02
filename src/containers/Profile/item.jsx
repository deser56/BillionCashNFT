import React from "react";
import { NavLink } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { useEffect, useState, useContext } from "react";
import musicImg from "../../assets/img/blog-img/music.png";
import AudioPlayer from 'react-h5-audio-player';

const ProfileItem = (props) => {
    const { themeMode } = useContext(AppContext);
    const [imgUrl, setImgUrl] = useState("");

    useEffect(() => {
        if (props.type === "mp3") {
            setImgUrl(musicImg);
        } else {
            setImgUrl(props.image);
        }
    }, [props])
    return (
        <div className={`col-12 col-md-6 col-lg-4 single_gallery_item ${props.ClassChange}`}>
            <div className={`${themeMode ? "light" : "dark"} pricing-item`}>
                <div className="wraper ">
                    <NavLink to={`/itemdetails/${props.itemId}`}><img src={imgUrl} alt="" /></NavLink>
                    {
                        props.type === "mp3" &&
                        <AudioPlayer
                            src={props.image}
                            onPlay={e => console.log("onPlay")}
                        />
                    }
                    <div className="">
                        <NavLink to={`/itemdetails/${props.itemId}`}><h4>{props.title}</h4></NavLink>
                    </div>
                    <span>
                        <span className="g-text">Price:</span> {props.price}  BC <span className="g-text ml-15"></span>
                    </span>
                    <span>
                        <span className="g-text">Royalties:</span> {props.royalty}  % <span className="g-text ml-15"></span>
                    </span>
                    <NavLink to={`/profile/${props.creator}`}>
                        <h4 className="pricing text-truncate ">Creator : {props.creator}  </h4>
                    </NavLink>
                </div>
            </div>
        </div>
    )
}

export default ProfileItem;