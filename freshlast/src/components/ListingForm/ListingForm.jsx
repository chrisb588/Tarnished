import { useState, useEffect } from 'react';
import './ListingForm.css'
import addimgicon from "../../assets/add_img_icon.svg"

/*
Quality Assurance:
1.) Make sure that discounted price is lower than original price
2.) Make sure that customer cannot enter empty data/all fields are filled

*/
export default function ListingForm  ({formData, setFormData, handleChange, handleFileUpload}) {
    const [previewURL, setPreviewURL] = useState(null)

    // for cleanup of memory in uploading images
    useEffect(() => {
        // If there's no image, don't do anything
        if (!formData.image) {
            setPreviewURL(null);
            return;
        }

        const objectUrl = URL.createObjectURL(formData.image);
        setPreviewURL(objectUrl);

        // cleanup
        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [formData.image]); 

    const handleStepper = (change) => {
        setFormData((prev) => {
            const newQuantity = parseInt(prev.quantity) + change;


            if (newQuantity < 0) return prev;

            return{
                ...prev,
                quantity: newQuantity
            }

        })
    }

    const blockInvalidChar = (e) => {
        // Prevent '-', '+', and 'e' (exponential notation)
        if (['-', '+', 'e', 'E'].includes(e.key)) {
            e.preventDefault();
        }
    };

    const imagePreview = formData.image 
        ? URL.createObjectURL(formData.image)
        : addimgicon;

    return(
        <div className="create-container">
            <div className="preface">
                <h1>Create New Listing</h1>
                <p>Add a new product to your stall.</p>
            </div>
            <div className="info-container-photo">
                <div className="info-preface">
                    <h4>Product photo</h4>
                    <p>Please add a photo for your product</p>
                </div>
                <div className={`img-container ${previewURL ? 'has-image' : 'is-empty'}`}>
                    <label htmlFor="image-input" style={{ cursor: 'pointer' }}>
                    <img src={previewURL || addimgicon} alt="Preview" />
                    </label>
                    <input 
                    type="file" 
                    id="image-input"
                    onChange={handleFileUpload}
                    accept="image/*"
                    style={{display: 'none'}}></input>
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
                        value={formData.name}
                        onChange={handleChange}
                        required
                        />
                    <div className="quantityDiv">
                        <div className="quantityWrapper">
                            <label htmlFor="quantity">Quantity Available</label>
                            <br/>
                            <div className="quantityStepper">
                                <button 
                                className="stepper-button"
                                type="button"
                                onClick={() => handleStepper(-1)}>-</button>
                                <input 
                                    type="number" 
                                    name="quantity"
                                    id="quantity"
                                    min="0"
                                    placeholder="0.00"
                                    step="0.01"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    onKeyDown={blockInvalidChar}
                                    required
                                    />
                                <button 
                                className="stepper-button"
                                type="button"
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
                                required
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
                            step="0.01"
                            placeholder="0.00"
                            required
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
                        step="0.01"
                        placeholder="0.00"
                        required
                    />
                    </div>
                </div>
            </div>


        </div>
    )

     
}
