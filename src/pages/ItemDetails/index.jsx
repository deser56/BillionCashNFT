import Head from '../../layouts/Head';
import ItemDetailsContainer from '../../containers/ItemDetails';
import Footer from '../../layouts/Footer';
import React from 'react'

// import '../../assets/css/itemDetails.css'

const ItemDetails = (props) => {
  const itemId =props.match.params.itemId

  return (
    <>
      <Head Title='Item Details' />
      <ItemDetailsContainer >{{itemId:itemId}}</ItemDetailsContainer>
      <Footer />
    </>
  );
}

export default ItemDetails;

