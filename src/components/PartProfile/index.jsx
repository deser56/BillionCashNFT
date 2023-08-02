/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'

function PartProfile({ address, croBalnce, isoBalnce, img1, img2, data }) {
    return (
        <div className="col-12 col-lg-3">
            <div className="service_single_content collection-item">
                <div className="collection_icon">
                    <img src={img1} className="center-block" alt="" />
                </div>
                <span className="aut-info">
                    <img className='author-back' src={img2} width="50" alt="" />
                </span>
                <div className="collection_info text-center">
                    <h6>Author Address</h6>
                    <p className="w-text mr-5p" style={{ overflowWrap: "break-word" }}>{address}</p>
                    <p className="mt-15">Your BNB Balance is {croBalnce} BNB</p>
                    <p className="mt-15">Your BC Balance is {isoBalnce} BC</p>
                    <div className="search-widget-area mt-15">
                        <form>
                            <input
                                type="text"
                                name="wallet"
                                id="wallet"
                                defaultValue={`${window.location.href}/profile/${address}`}
                            />
                            <button
                                className="btn"
                                type='button'
                                onClick={() => { navigator.clipboard.writeText(`localhost.com/profile/${address}`) }}
                            >
                                <i className="fa fa-copy"></i>
                            </button>
                        </form>
                    </div>

                    <ul className="social-links mt-30 mb-30">
                        {data && data.map((item, i) => (
                            <li key={i}><a ><span className={item.classIcon}></span></a></li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    )
}

export default PartProfile
