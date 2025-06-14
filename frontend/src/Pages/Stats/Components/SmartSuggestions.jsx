import React from 'react'
import { useEffect,useState } from 'react'
import {getSmartSuggestions} from "../../../services/api"

const SmartSuggestions = () => {

    const [suggestions,setSuggestions]=useState([])
     
    useEffect(()=>{
        fetchSuggestions()
    },[])

    const fetchSuggestions=async ()=>{
        try{
            const res=await getSmartSuggestions();
            setSuggestions(res.data.suggestions)
        }
        catch(err)
        {
            console.log(err.message)
        }
    }
return (
  <div className="bg-gradient-to-br from-[#1f2937] to-[#111827] border border-emerald-500 shadow-md p-6 rounded-xl w-full text-white mt-6">
    <h2 className="text-xl font-semibold text-emerald-400 text-center mb-4 tracking-wide drop-shadow">
      💡 Smart Suggestions
    </h2>
    {suggestions.length === 0 ? (
      <p className="text-gray-400 italic text-center">
        You're doing great! No suggestions for now 🎉
      </p>
    ) : (
      <ul className="list-disc list-inside space-y-2 text-sm text-gray-200">
        {suggestions.map((suggestion, idx) => (
          <li
            key={idx}
            className="hover:text-white hover:pl-1 transition-all duration-300 ease-in-out"
          >
            {suggestion}
          </li>
        ))}
      </ul>
    )}
  </div>
);

}

export default SmartSuggestions
