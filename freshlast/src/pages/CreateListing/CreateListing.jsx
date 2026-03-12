import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ListingForm from '../../components/ListingForm/ListingForm';
import { supabase } from '../../lib/supabaseClient';
import { createListing, updateListing, deleteListing, getListingById } from '../../api/listings';

import './CreateListing.css'

export default function CreateListing() {
    const { id } = useParams();
    const isCreating = !id;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        quantity: "",
        unit: "kg",
        originalprice: "",
        discountedprice: "",
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
                    });
                    setExistingImagePath(listing.image);
                }
            }
        };
        init();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = value.startsWith('-') ? 0 : value;
        setFormData((prev) => ({ ...prev, [name]: finalValue }));
    };

    const validate = () => {
        const requiredFields = ["name", "quantity", "unit", "originalprice", "discountedprice"];
        const isMissingFields = requiredFields.some(field => formData[field] === "");
        if (formData.discountedprice >= formData.originalprice) {
            alert("Discounted price can't be higher than or equal to original price!");
            return false;
        }
        if (isMissingFields) {
            alert("All fields are required! Please check your inputs.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (isCreating) {
            await createListing(
                merchantId,
                formData.name,
                formData.originalprice,
                null,
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
                existingImagePath,
                formData.unit,
                formData.quantity,
            );
        }
        navigate('/');
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!confirm("Are you sure you want to delete this listing?")) return;
        await deleteListing(id);
        navigate('/');
    };

    return (
        <div>
            <Link to="/" className="floating-add-btn">
                <p>Back to home</p>
            </Link>

            <form className='main-body'>
                <ListingForm formData={formData} setFormData={setFormData} handleChange={handleChange} />

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
