import React from 'react'

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-2">
            OUR PROCESS
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works? Follow the steps to the profit
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Looking to spice up snack time with something fun, flavorful, and a little nostalgic? 
            Meet Southern Sweet & Sour&apos;s signature Licorice Ropes! Whether you&apos;re eating them solo 
            or sharing with friends, these chewy ropes are perfect for snacking and smilin&apos;.
          </p>
        </div>

        {/* Steps Section */}
        <div className="relative">
          {/* Curved Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-orange-500 transform -translate-y-1/2 hidden lg:block">
            <svg className="w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
              <path
                d="M 0 50 Q 300 20 600 50 Q 900 80 1200 50"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-orange-500"
              />
            </svg>
          </div>

          {/* Steps Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative z-10">
            {/* Step 1 */}
            <div className="relative text-center lg:text-left">
              <div className="relative mb-8">
                {/* Background Number */}
                <div className="absolute -top-8 -left-4 text-9xl font-bold text-gray-100 select-none">
                  1
                </div>
                {/* Circle Node */}
                <div className="relative z-10 w-6 h-6 bg-gray-400 rounded-full mx-auto lg:mx-0 lg:ml-4 mb-4"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Sign Up for a Fundraiser
              </h3>
              <p className="text-gray-600 leading-relaxed">
                No Fees. No minimums. Sign up via our online form, email, or call our sales team. 
                We are invested in your success. Sign up at least one month in advance and we will 
                send you a box of samples so You can sell
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="relative mb-8">
                {/* Background Number */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-9xl font-bold text-gray-100 select-none">
                  2
                </div>
                {/* Circle Node */}
                <div className="relative z-10 w-6 h-6 bg-gray-400 rounded-full mx-auto mb-4"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Start Selling
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We make it easy. Each fundraiser runs for either 4 or 5 days (your choice). 
                We provide you a media kit along with some best practices to ensure you are successful.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center lg:text-right">
              <div className="relative mb-8">
                {/* Background Number */}
                <div className="absolute -top-8 -right-4 text-9xl font-bold text-gray-100 select-none">
                  3
                </div>
                {/* Circle Node */}
                <div className="relative z-10 w-6 h-6 bg-gray-400 rounded-full mx-auto lg:mx-0 lg:ml-auto lg:mr-4 mb-4"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Earn 50% Of Every Sale
              </h3>
              <p className="text-gray-600 leading-relaxed">
                50% of your sales (not counting tax or shipping) goes to your organization. 
                You can expect a check about 14 days after your fundraiser ends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks