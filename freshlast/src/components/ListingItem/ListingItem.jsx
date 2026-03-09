import testImg from '../../assets/testImg.png';
import './ListingItem.css'

export default function ListingItem() {
  return (
    <div className = "listing-border">

        <div className = "listing-image">
            <img src = {testImg}></img>
        </div>
        <div className='listing-info'>
            <p>
                <span className='listing-name'>
                    Listing Name
                </span>
                <br></br>
                <span className='original-price'>
                    Original Price    
                    </span> 
                &nbsp;|&nbsp;
                <span className='discounted-price'>
                    Price Now
                </span>
                <br></br>
                <span className='quantity'>
                    Quantity
                </span>
            </p>
        </div>
        <button className = "edit-button">
            Edit 
        </button>
    </div>
  );
}