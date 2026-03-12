import React, { useState} from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
import ListingForm from '../../components/ListingForm/ListingForm';
import { createListing } from '../../api/listings'

import './CreateListing.css'

export const validateForm = (formData) => {
    const requiredFields = ["name", "quantity", "unit", "originalprice", "discountedprice", "image"]
    const isMissingFields = requiredFields.some(field => formData[field] === "" || formData[field] === null);

    console.log(formData)

    if (Number(formData.discountedprice) >= Number(formData.originalprice)) {
        alert("Discounted price can't be higher than or equal to original price!")
        return false;
    }
    if (isMissingFields) {
        alert("All fields are required! Please check your inputs.");
        return false;
    }        

    return true
}

export default function CreateListing(){
    const [isCreating, setIsCreating] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        image: null,
        name: "",
        quantity: 0,
        unit: "kg",
        originalprice: 0,
        discountedprice: 0
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let finalValue = value

        if (type === 'number') {
            finalValue = value === "" ? "" : parseFloat(value);
            
            if (finalValue < 0) finalValue = 0;
        }

        setFormData((prev) => ({ 
            ...prev, 
            [name]: finalValue 
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
                
        if (file) {
            setFormData((prev) => ({
                ...prev,
                image: file
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); // for now

        const isValid = validateForm(formData)

        if (!isValid) {
            return
        }

        setIsSubmitting(true)
        try {
            const response = await createListing(
                currentMerchantId, 
                formData.name,
                formData.originalprice,
                formData.discountedprice,
                formData.image,
                formData.unit,
                formData.quantity,
            );

            console.log("Upload successful:", response);
            alert("Listing created successfully!");
            navigate('/');

            } catch (error) {
                console.error("Upload failed:", error.message);
                alert("Error creating listing: " + error.message);
            } finally {
                setIsSubmitting(false);
            }


    };


    return(
        <div>
            <Link to="/" className="floating-add-btn">
                    <p>Back to home</p>
                </Link>

            <form className='main-body'>
                <ListingForm 
                formData={formData} 
                setFormData={setFormData} 
                handleChange={handleChange}
                handleFileUpload={handleFileUpload}/>

                {isCreating ? (
                    <div className='button-div'>
                        <button 
                            className='create-button'
                            onClick={handleSubmit}>
                            Create Listing
                        </button>
                    </div>
                ) :
                (
                    <>
                    <div className='button-div'>
                        <button className='save-edit-button'>Save Listing</button>
                        <button className='delete-button'>Delete Listing</button>
                    </div>
                    </>
                )} 
            </form>
        </div>
    )
}