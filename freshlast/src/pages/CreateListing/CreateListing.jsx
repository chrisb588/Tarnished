import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ListingForm from '../../components/ListingForm/ListingForm';

import './CreateListing.css'
export default function CreateListing(){
    return(
        <div className="main-body">
            <Link to="/" className="floating-add-btn">
                    <p>Back to home</p>
                </Link>
                
            <ListingForm></ListingForm>

        </div>
    )
}