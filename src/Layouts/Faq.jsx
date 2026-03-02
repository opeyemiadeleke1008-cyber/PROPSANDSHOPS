import React, { useState } from 'react'

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: "How do you pack fragile photography props?",
      answer: "We use double-walled boxes and biodegradable honeycomb wrap. Every ceramic and glass item is stress-tested for shipping to ensure it arrives ready for your shoot."
    },
    {
      question: "Do you offer bulk discounts for studios?",
      answer: "Yes! For orders of 10 or more items, we offer a 15% studio discount. Please contact us with your gear list for a custom quote."
    },
    {
      question: "What is the return policy for backdrops?",
      answer: "Because backdrops are often painted to order, we accept returns within 7 days only if the item is unused and in its original rolling tube."
    },
    {
      question: "Are the wooden surfaces heat-resistant?",
      answer: "Our home props are treated with natural oils. They can handle warm plates, but we recommend avoiding direct contact with pots straight from the oven to preserve the finish."
    }
  ];

  function handleToggle(index) {
    setActiveIndex(activeIndex === index ? null : index);
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h2 className="text-2xl font-bold text-black mb-4"
              style={{ fontFamily: '"Orbitron"' }}>Frequently Asked Questions</h2>
      
      {faqData.map((item, index) => {
        const isOpen = activeIndex === index;

        return (
          <div key={index} style={{ borderBottom: '1px solid #eaeaea' }}>
            <button
              onClick={() => handleToggle(index)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                outline: 'none'
              }}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: '500', color: '#333' }}>
                {item.question}
              </span>

              {/* Animated Plus/Minus Icon */}
              <div style={{
                position: 'relative',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Horizontal line (Minus) */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  backgroundColor: '#000',
                  borderRadius: '2px'
                }} />
                {/* Vertical line (Plus) */}
                <div style={{
                  position: 'absolute',
                  width: '2px',
                  height: '100%',
                  backgroundColor: '#000',
                  borderRadius: '2px',
                  transition: 'transform 0.3s ease, opacity 0.3s ease',
                  // Rotates and fades to create the transition
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  opacity: isOpen ? 0 : 1
                }} />
              </div>
            </button>

            {/* Transitioning Answer Section */}
            <div style={{
              maxHeight: isOpen ? '200px' : '0',
              opacity: isOpen ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease'
            }}>
              <p style={{ paddingBottom: '20px', margin: 0, color: '#666', lineHeight: '1.6' }}>
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}