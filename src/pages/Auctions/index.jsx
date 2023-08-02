import Head from '../../layouts/Head';
import AuctionsContainer from '../../containers/Auctions';
import Footer from '../../layouts/Footer';
import React from 'react';

function Auctions(){

  return(
    <>
      <Head Title='Auctions' />
      <AuctionsContainer />
      <Footer />
    </>
  )
}

export default Auctions