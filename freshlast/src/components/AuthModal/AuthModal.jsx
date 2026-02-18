import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AuthForm from "../AuthForm/authForm";

import './Authmodal.css'

export default function AuthModal({ isOpen, onClose, supabase }) {


  if (!isOpen) return null; // Don't render anything if closed

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="close-button"
        >
          X
        </button>

        {/* Pass the mode down to the form */}
        <AuthForm/>
      </div>
    </div>
  );
}