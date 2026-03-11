import { useState } from 'react';
import './ListingForm.css'
import addimgicon from "../../assets/testImg.png"

export default function ListingForm(){
    const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    unit: "",
    originalprice: 0,
    discountedprice: 0,
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleStepper = (change) => {
        setFormData((prev) => {
            const newQuantity = prev.quantity + change;

            if (newQuantity < 0) return prev;

            return{
                ...prev,
                quantity: newQuantity
            }

        })
    }

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
                    {/*Do photo logic here soon*/}
                </div>
                <div className="img-container">
                    <img src={addimgicon} className ="addimgicon"/>
                </div>
            </div>
            <div className="info-container">
                <div className="info-preface">
                    <h4>Product Details</h4>
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
                        value={formData.name}
                        onChange={handleChange}
                        />
                    <div className="quantityDiv">
                        <div className="quantityWrapper">
                            <label htmlFor="quantity">Quantity Available</label>
                            <br/>
                            <div className="quantityStepper">
                                <button 
                                className="stepper-button"
                                onClick={() => handleStepper(-1)}>-</button>
                                <input 
                                    type="number" 
                                    name="quantity"
                                    id="quantity"
                                    min="0"
                                    placeholder="0.00"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    />
                                <button 
                                className="stepper-button"
                                onClick={() => handleStepper(+1)}>+</button>
                            </div>
                        </div>
                        <div className="unitWrapper">
                            <label htmlFor="unit">Unit</label>
                            <select 
                                name="unit" 
                                id="unit"
                                value={formData.unit}
                                onChange={handleChange}
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
                            value={formData.originalprice}
                            onChange={handleChange}
                            name="originalprice"
                            id="originalprice"
                            min="0"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="pricing">
                    <label htmlFor="discountedprice">Discounted Price</label>
                    <br></br>
                    <input 
                        type="number" 
                        name="discountedprice"
                        value={formData.discountedprice}
                        onChange={handleChange}
                        id="discountedprice"
                        min="0"
                        placeholder="0.00"
                    />
                    </div>
                </div>
            </div>


        </div>
    )

     
}
