/* eslint-disable no-unused-vars */

import { NavLink } from "react-router-dom";
import React from 'react'

function CardContainer({imgBig , imgSm ,name}){
	return(
        <div className="col-12 col-md-6 col-lg-3">

            <div  className="service_single_content collection-item">
                
                <div className="collection_icon">
                    <img src={imgBig} alt="" />
                </div>
                <span className="aut-info">
                    <img className='author-back' src={imgSm} width="50" alt="" />
                </span>
                <div className="collection_info text-center">
                    <h6>{name}</h6>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
                
            </div>
        </div>
	)
}

export default CardContainer