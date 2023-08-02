import { NavLink } from "react-router-dom";
import React from "react";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import musicImg from "../../assets/img/blog-img/music.png";
import AudioPlayer from 'react-h5-audio-player';

const FilterItem = (props) => {
	const { item } = props;
	const [categoryname, setCategory] = useState("");
	const { themeMode } =
		useContext(AppContext);

	const [imgUrl, setImgUrl] = useState("");

	useEffect(() => {
		if (item.type === "mp3") {
			setImgUrl(musicImg);
		} else {
			setImgUrl(item.image);
		}
	}, [item])

	useEffect(() => {
		if (item.category.length > 0) {
			switch (item.category) {
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
	}, [item])

	return (
		<div className={`col-12 col-md-6 col-lg-4 single_gallery_item ${item.category}`}>
			<div className={`${themeMode ? "light" : "dark"} pricing-item`}>
				<div className="wraper ">
					<NavLink to={`/itemdetails/${item.itemId}`}><img src={imgUrl} alt="" /></NavLink>
					{
						item.type === "mp3" &&
						<AudioPlayer
							src={item.image}
							onPlay={e => console.log("onPlay")}
						/>
					}
					<div className="">
						<NavLink to={`/itemdetails/${item.itemId}`}><h4>{item.title}</h4></NavLink>
					</div>
					<span>
						<span className="g-text">Price:</span> {item.price}  BC <span className="g-text ml-15"></span>
					</span>
					<span>
						<span className="g-text">Royalties:</span> {item.royalty}  % <span className="g-text ml-15"></span>
					</span>
					<div className="pricing  text-truncate ">Creator :{item.creator} </div>
					<span className=" pricing ">Category : {(categoryname).toLowerCase()} </span>
				</div>
			</div>
		</div>
	)
}

export default FilterItem;
