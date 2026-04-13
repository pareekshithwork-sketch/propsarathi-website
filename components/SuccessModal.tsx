"use client"

import type React from "react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  city?: string
  propertyType?: string
  budget?: string
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, userName, city, propertyType, budget }) => {
  if (!isOpen) return null

  const handleWhatsAppClick = () => {
    let message = `Hi! I just submitted an enquiry on PropSarathi. My name is ${userName}.`

    if (city || propertyType || budget) {
      message += ` I'm interested in`
      if (propertyType) message += ` ${propertyType}`
      if (city) message += ` in ${city}`
      if (budget) message += ` with a budget of ${budget}`
      message += `.`
    }

    message += ` I'd like to speak with a property expert.`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/917090303535?text=${encodedMessage}`, "_blank")
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[99998] backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

      <div className="fixed z-[99999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md animate-scale-in">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6 animate-bounce-once">
            <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-3">Congratulations, {userName}!</h3>
          <p className="text-gray-600 mb-2 text-base md:text-lg">Your enquiry has been successfully submitted!</p>
          <p className="text-gray-500 mb-8 text-sm md:text-base">
            Our property experts are reviewing your requirements and will contact you shortly.
          </p>

          <div className="bg-primary/5 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700 font-semibold mb-2">What happens next?</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Expert will review your requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Receive personalized property recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Get exclusive market insights</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Talk To Property Expert
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SuccessModal
