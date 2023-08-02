import Head from '../../layouts/Head';
import AuthorsContainer from '../../containers/Authors';
import Footer from '../../layouts/Footer';
import React from 'react';

const Authors = () => {

  return (
    <>
		<Head Title='Authors' />
		<AuthorsContainer />
		<Footer />
    </>
  );
}

export default Authors;

