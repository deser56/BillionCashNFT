import Head from '../../layouts/Head';
import CreateItemContainer from '../../containers/CreateItem';
import Footer from '../../layouts/Footer';
import React from 'react';


const CreateItem = () => {

  return (
    <>
      <Head Title='Create Item' />
      <CreateItemContainer />
      <Footer />
    </>
  );
}

export default CreateItem;

