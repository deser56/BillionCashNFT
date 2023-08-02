/* eslint-disable no-unused-vars */
import { NavLink } from "react-router-dom";
import React, { useContext } from "react";
import { AppContext } from "../../../context/AppContext";

const HeroContainer = () => {
	const { themeMode } =
    useContext(AppContext);
	return (
		<section className={`hero-section ${themeMode ? "light": "dark"}  moving section-padding`} id="home">
			<div className="moving-bg"></div>
			<div className="hero-section-content">
				<div className="container ">
					<div className="row align-items-center">
						<div className="col-12 col-lg-6 col-md-12">
							<div className="welcome-content">
								<div className="promo-section">
									<h3 className="special-head gradient-text">BC NFT Marketplace</h3>
								</div>
								<h1>The largest
									<span className="gradient-text"> &nbsp;NFT&nbsp;</span>
									marketplace for crypto collectibles and non-fungible tokens.
								</h1>
								{/* <p className="w-text">
									Digital marketplace for crypto collectibles and non-fungible tokens.
								</p> */}
								<p><span className="gradient-text">Digital marketplace for crypto collectibles and non-fungible tokens. </span></p>
								<div className="dream-btn-group">
									<NavLink to="/Discover" className="btn btn-Collect more-btn mr-3">Explore More</NavLink>
									<NavLink to="/createitem" className="btn btn-Collect more-btn">Upload NFT</NavLink>
								</div>
							</div>
						</div>
						<div className="col-lg-6"></div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default HeroContainer