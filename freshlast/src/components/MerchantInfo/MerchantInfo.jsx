import './MerchantInfo.css'
import { useState } from 'react';

export default function MerchantInfo({formData}) {
    const [photoPreview, setPhotoPreview] = useState(null)

    if (!formData) {
        return <div>Loading merchant details...</div>;
    }

    const {
        id, 
        stallName, 
        marketLocation, 
        phoneNumber, 
        operatingHoursStart, 
        operatingHoursEnd,
        operatingDays,
        category,
        location_photo,
        location,
    } = formData

    return (
        <div className="merchantinfo-container">
            <h3 className="merchantinfo-name">{stallName}</h3>
            <div className="merchantinfo-photo">
                <img src=''/>
            </div>
            <div className="merchantinfo-general">
                <div className='general-div'>
                    <span className="merchantinfo-label">Market Location:</span>
                    <span className="merchantinfo-answer">{marketLocation}</span>
                </div>
                <div className='general-div'>
                    <span className="merchantinfo-label">Contact #:</span>
                    <span className="merchantinfo-answer">{phoneNumber}</span>
                </div>
                <div className='general-div'>
                    <span className="merchantinfo-label">Schedule:</span>
                </div>
                <div className="merchantinfo-schedule">
                    <div className="hours-container">
                            <p>Monday:</p>
                            <p>10PM-12AM</p>
                            <p>Tuesday:</p>
                            <p>10PM-12AM</p>
                            <p>Wednesday:</p>
                            <p>10PM-12AM</p>
                            <p>Thursday:</p>
                            <p>10PM-12AM</p>                            
                    </div>
                    <div className="hours-container">
                            <p>Friday:</p>
                            <p>10PM-12AM</p>
                            <p>Saturday:</p>
                            <p>10PM-12AM</p>
                            <p>Sunday:</p>
                            <p>10PM-12AM</p>
                            <br></br>                 
                    </div>
                </div>
            </div>
            <h3 className="merchantinfo-name">STALL LOCATION</h3>
            <div className="merchantinfo-photo">
                <p>goon</p>
            </div>
        </div>
    );
  }
  