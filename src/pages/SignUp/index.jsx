import Head from '../../layouts/Head';
import SignUpContainer from '../../containers/SignUp';
import Footer from '../../layouts/Footer';
import React from 'react';

const SignUp = () => {


  return (
	<>
		<Head Title='Signup' />
		<SignUpContainer />
		<Footer />
	</>
  );
}

export default SignUp;

