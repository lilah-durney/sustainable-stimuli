import React, { useState } from 'react';
import { Info } from 'lucide-react';

export default function Home() {
  const [formValues, setFormValues] = useState({
    designBrief: "",
    sketchFile: null as File | null,
    semanticDistance: 50,
    visualSimilarity: 50,
    conceptualSimilarity: 50,
    outputTypes: {
      text: false,
      sketch: false,
    },
    sustainableGoal: ""
  });

  //TODO:Need to send all the info to the backend for processing
  const handleSubmit = () => {
    const payload = new FormData();
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen px-6 py-10 gap-10 bg-[#FFFAEE]">

      <div className="flex flex-col w-full md:w-1/2 space-y-6">

        <h1 className="text-2xl text-green-900 font-bold">Sustainable Stimuli Platform</h1>

        {/* Design Brief */}
        <textarea
          id = "designBrief"
          value={formValues.designBrief}
          onChange={(e) =>
            setFormValues((prev) => ({ ...prev, designBrief: e.target.value }))
          }
          className="bg-gray-200 w-full h-40 border-[20px] border-[#628395] rounded-xl p-4 resize-none focus:outline-none"
          placeholder="Enter design brief..."
        />

        {/* File Upload */}
        <div className="border-[20px] border-[#628395] rounded-xl p-10 bg-gray-200 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormValues((prev) => ({
                ...prev,
                sketchFile: e.target.files?.[0] || null,
              }))
            }
            className="w-full"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-10 w-full">
          {/* Search Refinement */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-green-900">Search Refinement</h2>
            <div className="bg-[#628395] rounded-xl p-6 text-white space-y-6 w-full max-w-md">

              {/* Semantic Distance */}
              <div>
                <div className="flex items-center mb-1 space-x-2">
                  <Info className="w-4 h-4" />
                  <label htmlFor="semanticDistance" className="font-medium text-sm">Semantic Distance</label>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm w-12 text-left">Near</span>
                  <input
                    id="semanticDistance"
                    type="range"
                    min={0}
                    max={100}
                    value={formValues.semanticDistance}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, semanticDistance: parseInt(e.target.value) }))
                    }
                    className="flex-1 h-2 bg-gray-300 rounded-full outline-none"
                  />
                  <span className="text-sm w-12 text-right">Far</span>
                </div>
              </div>

              {/* Visual Similarity */}
              <div>
                <div className="flex items-center mb-1 space-x-2">
                  <Info className="w-4 h-4" />
                  <label htmlFor="visualSimilarity" className="font-medium text-sm">Visual Similarity</label>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm w-12 text-left">Low</span>
                  <input
                    id="visualSimilarity"
                    type="range"
                    min={0}
                    max={100}
                    value={formValues.visualSimilarity}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, visualSimilarity: parseInt(e.target.value) }))
                    }
                    className="flex-1 h-2 bg-gray-300 rounded-full outline-none"
                  />
                  <span className="text-sm w-12 text-right">High</span>
                </div>
              </div>

              {/* Conceptual Similarity */}
              <div>
                <div className="flex items-center mb-1 space-x-2">
                  <Info className="w-4 h-4" />
                  <label htmlFor="conceptualSimilarity" className="font-medium text-sm">Conceptual Similarity</label>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm w-12 text-left">Low</span>
                  <input
                    id="conceptualSimilarity"
                    type="range"
                    min={0}
                    max={100}
                    value={formValues.conceptualSimilarity}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, conceptualSimilarity: parseInt(e.target.value) }))
                    }
                    className="flex-1 h-2 bg-gray-300 rounded-full outline-none"
                  />
                  <span className="text-sm w-12 text-right">High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sustainability Goals */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-green-900">Sustainable Goals</h2>
            <div className="bg-[#628395] rounded-xl p-4 text-white w-full space-y-2">
              {["Materials", "Energy", "Usability"].map((goal) => (
                <label key={goal} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="sustainableGoal"
                    value={goal}
                    checked={formValues.sustainableGoal === goal}
                    onChange={(e) =>
                      setFormValues({ ...formValues, sustainableGoal: e.target.value })
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-lg">{goal}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button type="submit" className="bg-green-900 text-white rounded-full px-6 py-2 w-max">
          Search
        </button>
      </div>

      {/*Placeholders for the output */}
      <div className="flex flex-col w-full md:w-1/2 space-y-6">
        <div className="bg-gray-200 border border-[#628395] border-[20px] rounded-xl p-6 text-center text-gray-800 w-full h-48 flex items-center justify-center">
          <p className="text-sm">Text Output</p>
        </div>
        <div className="bg-gray-200 border border-[#628395] border-[20px] rounded-xl p-6 text-center text-gray-800 w-full h-80 flex items-center justify-center">
          <p className="text-sm">Image Output</p>
        </div>
      </div>

    </div>
  );
}
