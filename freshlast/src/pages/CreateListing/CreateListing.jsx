import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ListingForm from '../../components/ListingForm/ListingForm';

import './CreateListing.css'
export default function CreateListing(){
    const [isCreating, setIsCreating] = useState(true);
    return(
        <div className="main-body">
            <Link to="/" className="floating-add-btn">
                    <p>Back to home</p>
                </Link>
                
            <ListingForm/>

            {isCreating ? (
                <div className='button-div'>
                    <button className='create-button'>Create Listing</button>
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

        </div>
    )
}