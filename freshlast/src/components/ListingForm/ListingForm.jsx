import './ListingForm.css'
import addimgicon from "../../assets/testImg.png"

export default function ListingForm(){
    return(
        <div className="create-container">
            <div className="preface">
                <h4>Create New Listing</h4>
                <p>Add a new product to your stall.</p>
            </div>
            <div className="info-container-photo">
                <div className="info-preface">
                    <h4>Product photo</h4>
                    <p>Please add a photo for your product</p>
                </div>
                <div className="img-container">
                    <img src={addimgicon} className ="addimgicon"/>
                </div>
            </div>
            <div className="info-container">
                <div className="info-preface">
                    <h4>product details</h4>
                    <p>Enter details about your products</p>
                </div>
                <div className="descriptionInput">
                    <label htmlFor="productName">Product Name</label>
                    <input
                        type="text"
                        name="name"
                        id="productName"
                        placeholder="e.g. Cabbage, Carrot, etc."
                        className="formInput"
                        />
                    <div className="quantityInput">
                        <div className="quantityWrapper">
                            <label htmlFor="quantity">Quantity Available</label>
                            <br/>
                            <input 
                                type="number" 
                                name="quantity"
                                id="quantity"
                                min="0"
                                step="0.01" // Allows decimals for price
                                placeholder="0.00"
                                />
                        </div>
                        <div className="quantityWrapper">
                            <label htmlFor="unit">Unit</label>
                            <br/>
                            <select 
                                name="unit" 
                                id="unit"
                                >
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div className="info-container">
                <div className="info-preface">
                    <h4>Pricing</h4>
                    <p>Enter your original and discounted prices</p>
                </div>
                <div className="priceInput">
                    <div className="pricing">
                        <label htmlFor="originalprice">Original Price</label>
                        <br></br>
                        <input 
                            type="number"

                            name="originalprice"
                            id="originalprice"
                            min="0"
                            step="0.01" // Allows decimals for price
                            placeholder="0.00"
                        />
                    </div>
                    <div className="pricing">
                    <label htmlFor="discountedprice">Discounted Price</label>
                    <br></br>
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
            </div>

        </div>
    )

     
}
