import Breadcumb from '../../components/Breadcumb'
import TopSellers from '../../components/TopSellers'
import CardSection from './CardSection'
import React from 'react';

const AuthorsContainer = () => {

  return (
    <>
		<Breadcumb  
		          namePage='Authors'
		          title='Authors'
		/>
		<TopSellers />
		<CardSection />
    </>
  );
}

export default AuthorsContainer;