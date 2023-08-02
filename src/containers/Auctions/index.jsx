import Breadcumb from '../../components/Breadcumb'
import LiveAuctions from '../../components/LiveAuctions'
import React from 'react';

const AuctionsContainer = () => {

  return (
  	<>
      <Breadcumb  
                  namePage='Auctions'
                  title='Auctions'
      />
      <LiveAuctions />

    </>
  );
}

export default AuctionsContainer;
