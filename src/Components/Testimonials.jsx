import { Quote } from "lucide-react";
import React from "react";

export default function Testimonials(testimonials) {
  return (
    <div className="flex flex-col gap-4 my-10">
      <p>
        <Quote size={30} strokeWidth={2} className="text-amber-400"/>
      </p>
      <p className="text-lg text-gray-800 italic">"{testimonials.det}"</p>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold text-gray-900">{testimonials.name}</h3>
        <p className="text-gray-600 text-sm">{testimonials.role}</p>
      </div>
    </div>
  );
}
