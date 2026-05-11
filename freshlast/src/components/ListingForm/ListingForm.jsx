import { useState, useEffect } from 'react';
import './ListingForm.css';
import addimgicon from '../../assets/add_img_icon.svg';

export default function ListingForm({
    formData, setFormData, handleChange, handleFileUpload,
    existingPreviewURL = null, onSubmit,
}) {
    const [previewURL, setPreviewURL] = useState(null);

    useEffect(() => {
        if (!formData.image) { setPreviewURL(existingPreviewURL || null); return; }
        if (!(formData.image instanceof File)) { setPreviewURL(formData.image); return; }
        const url = URL.createObjectURL(formData.image);
        setPreviewURL(url);
        return () => URL.revokeObjectURL(url);
    }, [formData.image]);

    const blockInvalidChar = (e) => {
        if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
    };

    const priceWarning =
        formData.originalprice && formData.discountedprice &&
        Number(formData.discountedprice) >= Number(formData.originalprice);

    const savings =
        formData.originalprice && formData.discountedprice &&
            Number(formData.discountedprice) < Number(formData.originalprice)
            ? Math.round(((formData.originalprice - formData.discountedprice) / formData.originalprice) * 100)
            : null;

    return (
        <div className="lf">
            {/* HEADER */}
            <header className="lf__header">
                <div>
                    <h1 className="lf__title">Create New Listing</h1>
                    <p className="lf__subtitle">Add a fresh product to your stall in just a moment.</p>
                </div>
                {onSubmit && (
                    <button className="lf__publish" onClick={onSubmit}>
                        Publish Listing
                    </button>
                )}
            </header>

            <div className="lf__grid">
                {/* LEFT — main fields */}
                <div className="lf__main">
                    {/* Product Details */}
                    <section className="lf__card">
                        <div className="lf__card-head">
                            <span className="lf__step">1</span>
                            <div>
                                <h3>Product Details</h3>
                                <p>Describe what you're selling.</p>
                            </div>
                        </div>

                        <div className="lf__field">
                            <label htmlFor="productName">Product Name</label>
                            <input
                                type="text" name="name" id="productName"
                                placeholder="e.g. Fresh Cabbage"
                                value={formData.name} onChange={handleChange} required
                            />
                        </div>

                        <div className="lf__triple">
                            <div className="lf__field">
                                <label htmlFor="quantity">Quantity</label>
                                <input
                                    type="number" name="quantity" id="quantity"
                                    min="0" step="1" placeholder="0"
                                    value={formData.quantity} onChange={handleChange}
                                    onKeyDown={blockInvalidChar} required
                                />
                            </div>
                            <div className="lf__field">
                                <label htmlFor="unit">Unit</label>
                                <select name="unit" id="unit" value={formData.unit} onChange={handleChange} required>
                                    <option value="kg">kg</option>
                                    <option value="lbs">lbs</option>
                                </select>
                            </div>
                            <div className="lf__field">
                                <label htmlFor="type">Product Type</label>
                                <select name="type" id="type" value={formData.type} onChange={handleChange} required>
                                    <option value="vegetable">Vegetables</option>
                                    <option value="fruit">Fruit</option>
                                    <option value="chicken">Chicken</option>
                                    <option value="pork">Pork</option>
                                    <option value="beef">Beef</option>
                                    <option value="seafood">Seafood</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Pricing */}
                    <section className="lf__card">
                        <div className="lf__card-head">
                            <span className="lf__step">2</span>
                            <div>
                                <h3>Pricing</h3>
                                <p>Set the original and your discounted price.</p>
                            </div>
                            {savings !== null && (
                                <span className="lf__savings">Save {savings}%</span>
                            )}
                        </div>

                        <div className="lf__double">
                            <div className="lf__field">
                                <label htmlFor="originalprice">Original Price</label>
                                <div className="lf__input-prefix">
                                    <span>₱</span>
                                    <input
                                        type="number" name="originalprice" id="originalprice"
                                        min="0" step="1" placeholder="0.00"
                                        value={formData.originalprice} onChange={handleChange}
                                        onKeyDown={blockInvalidChar} required
                                    />
                                </div>
                            </div>
                            <div className="lf__field">
                                <label htmlFor="discountedprice">Discounted Price</label>
                                <div className={`lf__input-prefix${priceWarning ? ' lf__input-prefix--error' : ''}`}>
                                    <span>₱</span>
                                    <input
                                        type="number" name="discountedprice" id="discountedprice"
                                        min="0" step="1" placeholder="0.00"
                                        value={formData.discountedprice} onChange={handleChange}
                                        onKeyDown={blockInvalidChar} required
                                    />
                                </div>
                            </div>
                        </div>

                        {priceWarning && (
                            <p className="lf__error">Discounted price must be lower than the original price.</p>
                        )}
                    </section>

                    {/* Availability */}
                    <section className="lf__card">
                        <div className="lf__card-head">
                            <span className="lf__step">3</span>
                            <div>
                                <h3>Availability</h3>
                                <p>How long should this listing stay live?</p>
                            </div>
                        </div>

                        <div className="lf__field">
                            <label htmlFor="availabilityWindow">Availability Window</label>
                            <select
                                name="availabilityWindow" id="availabilityWindow"
                                value={formData.availabilityWindow} onChange={handleChange} required
                            >
                                <option value="ends_today">Ends Today</option>
                                <option value="1_day">1 Day</option>
                                <option value="2_days">2 Days</option>
                                <option value="3_days">3 Days</option>
                            </select>
                        </div>
                    </section>
                </div>

                {/* RIGHT — sidebar */}
                <aside className="lf__side">
                    <section className="lf__card lf__card--upload">
                        <div className="lf__card-head">
                            <div>
                                <h3>Product Photo</h3>
                                <p>A bright, clear photo sells faster.</p>
                            </div>
                        </div>

                        <label
                            htmlFor="image-input"
                            className={`lf__upload${previewURL ? ' lf__upload--has-image' : ''}`}
                        >
                            {previewURL ? (
                                <img src={previewURL} alt="Preview" />
                            ) : (
                                <div className="lf__upload-empty">
                                    <img src={addimgicon} alt="" />
                                    <p><strong>Click to upload</strong></p>
                                    <span>PNG or JPG, up to 5MB</span>
                                </div>
                            )}
                        </label>
                        <input
                            type="file" id="image-input"
                            onChange={handleFileUpload} accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </section>

                    <section className="lf__tip">
                        <h4>💡 Pro Tip</h4>
                        <p>
                            Listings with a photo and a discount of 20% or more sell up to <strong>3× faster</strong>.
                            Use natural light when possible.
                        </p>
                    </section>
                </aside>
            </div>
        </div>
    );
}
