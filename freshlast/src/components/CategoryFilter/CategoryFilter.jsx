import { useState } from "react"
import './CategoryFilter.css'

export default function CategoryFilter({name}){
    const [isSelected, setIsSelected] = useState(true)

    const handleToggle = () => {
        setIsSelected(!isSelected)
    }

    return(
        <div 
        className={`category-filter ${isSelected ? "highlighted" : ""}`}
        onClick={handleToggle}
        >
            {name}
        </div>
    )
}