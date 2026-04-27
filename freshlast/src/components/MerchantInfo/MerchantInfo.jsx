import './MerchantInfo.css'

export default function MerchantInfo({formData}) {
    const [photoPreview, setPhotoPreview] = useState(null)

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
    } = data

    return (
        <div className="merchantinfo-container">
            <h3 className="merchantinfo-name">{formData.name}</h3>
            <div className="merchantinfo-photo">
                <img src=''/>
            </div>
            <div className="merchantinfo-general">
                <div className='general-div'>
                    <span className="merchantinfo-label">Market Location:</span>
                    <span className="merchantinfo-answer">Goon</span>
                </div>
                <div className='general-div'>
                    <span className="merchantinfo-label">Contact #:</span>
                    <span className="merchantinfo-answer">0718 423 1231</span>
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
  