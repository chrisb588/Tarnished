import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
import ListingForm from '../../components/ListingForm/ListingForm';


import './CreateListing.css'
export default function CreateListing(){
    const [isCreating, setIsCreating] = useState(true);
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: "",
        quantity: "",
        unit: "kg",
        originalprice: "",
        discountedprice: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Add your logic here to block negatives (as discussed before)
        const finalValue = value.startsWith('-') ? 0 : value;

        setFormData((prev) => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // for now
        console.log("Submitting Data:", formData);
        // Add your API call here (e.g., fetch or axios)
        navigate('/');
    };

    return(
        <div>
            <Link to="/" className="floating-add-btn">
                    <p>Back to home</p>
                </Link>

            <form className='main-body'>
                <ListingForm formData={formData} setFormData={setFormData} handleChange={handleChange}/>

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