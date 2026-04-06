import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ListingForm from '../../components/ListingForm/ListingForm';
import { supabase } from '../../lib/supabaseClient';
import { createListing, updateListing, deleteListing, getListingById } from '../../api/listings';

import './CreateListing.css'

const validateForm = (formData) => {
    console.log(formData)
    const requiredFields = ["name", "quantity", "unit", "originalprice", "discountedprice", "image"]
    const isMissingFields = requiredFields.some(field => formData[field] === "" || formData[field] === null);
    
    if (Number(formData.quantity) == 0){
        alert("Quantity can't be 0!")
        return false
    }

    if (Number(formData.originalprice) == 0){
        alert("Original price can't be 0!")
        return false
    }


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
    const { id } = useParams();
    const isCreating = !id;
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

    const [merchantId, setMerchantId] = useState(null);
    const [existingImagePath, setExistingImagePath] = useState(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setMerchantId(user.id);

            if (id) {
                const listing = await getListingById(id);
                if (listing) {
                    setFormData({
                        name: listing.name,
                        quantity: listing.quantity,
                        unit: listing.unit,
                        originalprice: listing.original_price,
                        discountedprice: listing.discounted_price,
                        image: listing.image,
                    });
                    setExistingImagePath(listing.image);
                }
            }
        };
        init();
    }, [id]);

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
        e.preventDefault();
        if (!validateForm(formData)) return;

        setIsSubmitting(true);
        try {
            if (isCreating) {
                await createListing(
                    merchantId,
                    formData.name,
                    formData.originalprice,
                    formData.discountedprice,
                    formData.image,
                    formData.unit,
                    formData.quantity,
                );
            } else {
                await updateListing(
                    id,
                    merchantId,
                    formData.name,
                    formData.originalprice,
                    formData.discountedprice,
                    formData.image instanceof File ? formData.image : existingImagePath,
                    formData.unit,
                    formData.quantity,
                );
            }
            navigate('/');
        } catch (error) {
            console.error("Failed:", error.message);
            alert("Error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!confirm("Are you sure you want to delete this listing?")) return;
        await deleteListing(id);
        navigate('/');
    };


    return (
        <div className='main-container'>
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
                ) : (
                    <>
                        <div className='button-div'>
                            <button className='save-edit-button' onClick={handleSubmit}>Save Listing</button>
                            <button className='delete-button' onClick={handleDelete}>Delete Listing</button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
}
