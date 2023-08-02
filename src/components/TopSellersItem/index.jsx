import React from 'react'

function TopSellersItem({rank , img ,title ,price}){

  return(
    <div className="author-item">
        <div className="author-rank">{rank}</div>
        <div className="author-img"><img className='author-back' src={img} width="70" alt="" /></div>
        <div className="author-info">
            <a href="profile.html"><h5 className="author-name">{title}</h5></a>
            <p className="author-earn mb-0">{price} BNB</p>
        </div>
    </div>
  )
}

export default TopSellersItem



