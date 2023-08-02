import Head from '../../layouts/Head';
import LoginContainer from '../../containers/Login';
import Footer from '../../layouts/Footer';
import React from 'react';

const Login = () => {


  return (
  	<>
		<Head Title='Login' />
		<LoginContainer />
		<Footer />
	</>

  );
}

export default Login;

