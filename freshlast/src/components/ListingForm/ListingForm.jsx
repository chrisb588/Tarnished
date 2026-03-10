import './ListingForm.css'
import addimgicon from "../../assets/testImg.png"

export default function ListingForm(){
    return(
        <div className="create-container">
            <div className="preface">
                <h4>Create New Listing</h4>
                <p>Add a new product to your stall.</p>
            </div>
            <div className="info-container">
                <p>product photo</p>
                <div className="img-container">
                    <img src={addimgicon} className ="addimgicon"/>
                </div>
            </div>
            <div className="info-container">
                <h4>product details</h4>
                <p>Enter details about your products</p>
                <input
                    type="text"
                    name="name"
                    placeholder="name of product"
                    className="formInput"
                    />
                <input 
                    type="number" 
                    name="price"
                    min="0"
                    step="0.01" // Allows decimals for price
                    placeholder="0.00"
                    />
                <label htmlFor="unit">Unit</label>
                <select 
                    name="unit" 
                    id="unit"
                    >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                </select>
            </div>
            <div className="info-container">
                <p>Price</p>
                <label htmlFor="originalprice">Original Price</label>
                <input 
                    type="number" 
                    name="originalprice"
                    id="originalprice"
                    min="0"
                    step="0.01" // Allows decimals for price
                    placeholder="0.00"
                />
                <label htmlFor="discountedprice">Discounted Price</label>
                <input 
                    type="number" 
                    name="discountedprice"
                    id="discountedprice"
                    min="0"
                    step="0.01" // Allows decimals for price
                    placeholder="0.00"
                />
            </div>

        </div>
    )

     
}
