"use client";
import { useState } from "react";
import Image from "next/image";

const productOptions = [
  "Traditional - 3 Red Twist",
  "Sour - Blue Raspberry, Fruit Rainbow, Apple",
  "Sour - Watermelon, Cherry, Berry Delight",
  "Sweet - Fruit Rainbow, Cotton Candy, Strawberry - Banana",
  "Sweet - Watermelon, Berry Delight, Cherry",
  "Traditional - 2 Red Twist",
  "Sour - Green Apple, Blue Raspberry, Cherry",
  "Sweet - Cotton Candy, Strawberry, Vanilla",
  "Traditional - 4 Red Twist",
  "Sour - Lemon, Lime, Orange",
];

const ShopOur = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? productOptions.length - 5 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= productOptions.length - 5 ? 0 : prevIndex + 1
    );
  };

  const handleCheckboxChange = (index: number) => {
    setSelectedOptions((prev) => {
      if (prev.includes(index)) {
        return prev.filter((item) => item !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  return (
    <section className="h-full w-full bg-white flex flex-col justify-center items-center">
      <div className="h-fit w-full layout py-6 md:py-8 lg:py-10 px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left text-black w-full md:w-2/3 lg:w-1/3">
          Shop Our Licorice Ropes
        </h1>
      </div>
      <div className="h-full w-full layout gap-6 md:gap-8 lg:gap-10 flex flex-col lg:flex-row justify-between items-center px-4">
        <div className="h-full w-full lg:w-[40%] flex justify-center">
          <Image
            src="/assets/images/slider.png"
            alt="slider"
            width={750}
            height={500}
            className="w-full max-w-md md:max-w-lg lg:max-w-none"
          />
        </div>
        <div className="h-full w-full lg:w-[60%] p-4 md:p-6">
          <h3 className="text-2xl md:text-3xl font-bold text-black py-3 md:py-5">
            3 pack $27
          </h3>
          <h5 className="text-lg md:text-xl lg:text-2xl py-2 md:py-3 text-black">
            Choose One of the following 3 packs:
          </h5>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            {/* Checkbox List with Sliding Animation */}
            <div className="flex-1 overflow-hidden">
              <div
                className="space-y-2 transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateY(-${currentIndex * 40}px)`,
                  height: "160px", // Smaller height for mobile
                }}
              >
                {productOptions.map((option, index) => {
                  const isSelected = selectedOptions.includes(index);

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors h-8 md:h-9 py-2 md:py-6"
                      onClick={() => handleCheckboxChange(index)}
                    >
                      <div
                        className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                          isSelected
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          isSelected
                            ? "font-semibold text-black"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

                          {/* Vertical Navigation Buttons */}
              <div className="flex flex-row md:flex-col gap-2 justify-center md:justify-start">
                <button
                  onClick={handlePrevious}
                  className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopOur;
