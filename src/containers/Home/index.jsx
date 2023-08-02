/* eslint-disable no-unused-vars */
import HeroContainer from './Hero'
import TopCollections from '../../components/TopCollections'
import React from 'react'

import '../../assets/css/home.css'
import NFTFilter from '../../pages/NFTFilter'

const HomeContainer = () => {

	return (
		<>
			<HeroContainer />
			<TopCollections />
			<NFTFilter />
		</>
	);
}

export default HomeContainer;