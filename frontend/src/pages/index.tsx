import React, { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import ClipLoader from "react-spinners/ClipLoader"


export default function Home() {
  const [formValues, setFormValues] = useState({
    designBrief: "",
    sketchFile: null as File | null,
    semanticDistance: 50,
    visualSimilarity: 50,
    conceptualSimilarity: 50,
    sustainableGoal: "",
    searchType: "",
    outputTypes: {
      Text: false,
      Image: false,
    }
  });

    type Output = {
      guideline: string, 
      extractedWords: string[], 
      category: string,
      explanation: string, 
      suggestion: string, 
      similarityScore: number,
      replicateImageUrl:  string,
      permanentGeneratedImageUrl: string,
      estimatedEmissions: {
        energyWh: number;
        emissionsGrams: number;
  };
      
  };

  const [output, setOutput] = useState<Output | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const renderOutput = () => {
      if (!output) {
        return { text: null, image: null };
      }

      const shouldShowText = formValues.outputTypes.Text;
      const shouldShowImage = formValues.outputTypes.Image;

      const textContent = shouldShowText ? (
          <div className="space-y-1 text-m text-left text-gray-800">
            <p><span className="font-semibold text-green-900">Guideline:</span> {output.guideline}</p>

            {formValues.searchType === "GenAI" && (
              <>
                <p>
                  <span className="font-semibold text-green-900">Category:</span> {output.category}
                </p>
                <p>
                  <span className="font-semibold text-green-900">Explanation:</span>{" "}
                  {output.explanation}
                </p>
                <p>
                  <span className="font-semibold text-green-900">Suggestion:</span>{" "}
                  {output.suggestion}
                </p>
              </>
            )}
          </div>
        ) : null;

        const imageContent =
          shouldShowImage && output.replicateImageUrl ? (
            <img
              src={output.replicateImageUrl}
              alt="Generated Sketch"
              className="max-w-full max-h-full object-contain"
            />
          ) : null;

        return { text: textContent, image: imageContent };
      };


  const handleSubmit = async () => {
    setHasSearched(true);
    setOutput(null);
    setError(null)
    setLoading(true);

    const payload = new FormData();
    if (formValues.designBrief) {
       payload.append("designBrief", formValues.designBrief)
    }

    if (formValues.sketchFile) {
      payload.append("sketchFile", formValues.sketchFile)
    }

    payload.append("semanticDistance", formValues.semanticDistance.toString())
    payload.append("visualSimilarity", formValues.visualSimilarity.toString())
    payload.append("conceptualSimilarity", formValues.conceptualSimilarity.toString())
    payload.append("searchType", formValues.searchType)
    payload.append("sustainableGoal", formValues.sustainableGoal)
    
    Object.entries(formValues.outputTypes).forEach(([key, value]) => {
    payload.append(`outputTypes[${key}]`, value.toString());
  });
   

    try {
      const response = await fetch("http://localhost:4000/api/suggestions/upload", {
        method: "POST",
        body: payload,
      });

        if (!response.ok) {
          let errorMessage = "Something went wrong. Please try again.";
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (jsonErr) {
            const text = await response.text();
            if (text) errorMessage = text;
          }
          throw new Error(errorMessage);
        }

      const data = await response.json();
      setOutput({
          guideline: data.output.guideline,
          extractedWords: data.output.extractedWords,
          category: data.output.category,
          explanation: data.output.explanation,
          suggestion: data.output.suggestion,
          similarityScore: data.output.similarityScore,
          replicateImageUrl: data.replicateImageUrl,
          permanentGeneratedImageUrl: data.output.permanentGeneratedImageUrl,
          estimatedEmissions: data.output.estimatedEmissions, 
    });
    } catch (err: any) {
      console.error("Error submitting data", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }

    };
  
    const { text, image } = renderOutput();

    const hasInput = formValues.designBrief.trim() !== "" || formValues.sketchFile !== null;
    const hasSearchType = formValues.searchType !== "";
    const hasOutputType = Object.values(formValues.outputTypes).some((v) => v);

    const isSubmitDisabled = !(hasInput && hasSearchType && hasOutputType);

    useEffect(() => {
      if (hasSearched) {
        setHasSearched(true);
        setOutput(null);
      
      }
    }, [formValues]);


    return (
      <div className="flex flex-col md:flex-row w-full max-h-screen px-6 py-5 gap-10 bg-white " >
        

        {/* Left column content */}
        <div className="flex flex-col mt-2 w-full md:w-1/2 h-full justify-between">
        <h1 className="text-3xl text-green-900 font-bold mb-3 text-shadow-lg"
        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>Sustainable Stimuli Platform</h1>

          <div className = "space-y-4">
            

          {/* Design Brief */}
          <div>
            <h2 className="text-lg font-bold mb-2 text-green-900">Design Brief</h2>
            <textarea
              id = "designBrief"
              value={formValues.designBrief}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, designBrief: e.target.value }))
              }
              className="shadow-sm shadow-gray-400 bg-gray-200 w-full h-40 border-[6px] border-[#628395] rounded-xl p-4 resize-none focus:outline-none"
              placeholder="Enter design brief..."
            />
          </div>

          {/* File Upload */}
          <div>
            <h2 className="text-lg font-bold mb-2 text-green-900">Sketch Upload</h2>
            <div className="shadow-sm shadow-gray-400 border-[6px] border-[#628395] rounded-xl p-7 bg-gray-200 text-center">
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
          </div>

          <div className="flex flex-col md:flex-row gap-10 w-full">
            {/* Search Refinement */}
            <div>
              <h2 className="text-lg font-bold mb-2 text-green-900">Search Refinement</h2>
              <div className="shadow-sm shadow-gray-400 bg-[#628395] rounded-xl p-6 text-white space-y-6 w-full max-w-md">


              {/* Semantic Distance (Structured only) */}
              <div>
                <div className="flex items-center mb-1">
                  
                  <div className="relative group">
                    <Info className="w-4 h-4 cursor-pointer" />
                    <div className="absolute bottom-full mb-1 hidden group-hover:block w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg z-30">
                      Controls how conceptually close the results are to your input text. Lower values return more literal matches.
                    </div>
                  </div>
                  <label htmlFor="semanticDistance" className="font-medium text-sm ml-2">Semantic Distance</label>
                </div>
            
                <div className="flex items-center space-x-3 relative group">
                  <span className="text-sm w-12 text-left">Near</span>
                  <input
                    id="semanticDistance"
                    type="range"
                    min={0}
                    max={100}
                    value={formValues.semanticDistance}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        semanticDistance: parseInt(e.target.value),
                      }))
                    }
                    disabled={formValues.searchType !== "Structured"}
                    className={`flex-1 h-2 bg-gray-300 rounded-full outline-none ${
                      formValues.searchType !== "Structured" ? "cursor-not-allowed opacity-40" : ""
                    }`}
                  />
                  <span className="text-sm w-12 text-right">Far</span>

                  {formValues.searchType !== "Structured" && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg z-30">
                      Semantic distance only applies to Structured search.
                    </div>
                  )}
                </div>
              </div>


              {/* Visual Similarity (GenAI only) */}
              <div>
                <div className="flex items-center mb-1">
                  <div className="relative group">
                    <Info className="w-4 h-4 cursor-pointer" />
                    <div className="absolute bottom-full mb-1 hidden group-hover:block w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg z-30">
                      Adjusts how visually similar the AI-generated images are to your uploaded sketch.
                    </div>
                  </div>
                  <label htmlFor="visualSimilarity" className="font-medium text-sm ml-2">Visual Similarity</label>
                </div>

                <div className="flex items-center space-x-3 relative group">
                  <span className="text-sm w-12 text-left">Low</span>
                  <input
                    id="visualSimilarity"
                    type="range"
                    min={0}
                    max={100}
                    value={formValues.visualSimilarity}
                    disabled={formValues.searchType !== "GenAI"}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        visualSimilarity: parseInt(e.target.value),
                      }))
                    }
                    className={`flex-1 h-2 rounded-full outline-none ${
                      formValues.searchType !== "GenAI" ? "bg-gray-400 cursor-not-allowed opacity-40" : "bg-gray-300"
                    }`}
                  />
                  <span className="text-sm w-12 text-right">High</span>

                  {formValues.searchType !== "GenAI" && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg z-30">
                      Visual similarity only applies to GenAI search.
                    </div>
                  )}
                </div>
              </div>


              {/* Conceptual Similarity (GenAI only) */}
              <div>
                <div className="flex items-center mb-1">

                  <div className="relative group">
                    <Info className="w-4 h-4 cursor-pointer" />
                    <div className="absolute bottom-full mb-1 hidden group-hover:block w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg z-30">
                      Influences how creatively the AI interprets your input — higher values allow for more abstract suggestions.
                    </div>
                  </div>
                  <label htmlFor="conceptualSimilarity" className="font-medium text-sm ml-2">Conceptual Similarity</label>
                </div>

                <div className="flex items-center space-x-3 relative group">
                  <span className="text-sm w-12 text-left">Low</span>
                  <input
                    id="conceptualSimilarity"
                    type="range"
                    min={0}
                    max={100}
                    value={formValues.conceptualSimilarity}
                    disabled={formValues.searchType !== "GenAI"}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        conceptualSimilarity: parseInt(e.target.value),
                      }))
                    }
                    className={`flex-1 h-2 rounded-full outline-none ${
                      formValues.searchType !== "GenAI" ? "bg-gray-400 cursor-not-allowed opacity-40" : "bg-gray-300"
                    }`}
                  />
                  <span className="text-sm w-12 text-right">High</span>


                  {formValues.searchType !== "GenAI" && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg z-30">
                      Conceptual similarity only applies to GenAI search.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>



            <div className = "flex flex-col space-y-4 w-full">
                <div className = "flex gap-4">
                  {/* Search Type */}
                  <div className="flex-1 relative">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-green-900">Search Type</h2>
                      </div>

                      <div className="shadow-sm shadow-gray-400 bg-[#628395] rounded-xl p-4 text-white w-full space-y-2">
                        {["Structured", "GenAI"].map((type) => (
                          <div key={type} className="flex items-center justify-between relative">
                            <div className="flex items-center space-x-2">
                              <input 
                                type="radio"
                                name="searchType"
                                value={type}
                                checked={formValues.searchType === type}
                                onChange={(e) => 
                                  setFormValues({ ...formValues, searchType: e.target.value })
                                }
                                className="w-5 h-5"
                              />
                              <span className="text-sm">{type}</span>
                            </div>

                            <div className="relative group">
                              <Info className="w-4 h-4 cursor-pointer" />
          
                              {type === "Structured" && (
                                <div className="absolute right-6 top-4 hidden group-hover:block z-20 w-64 p-3 text-sm text-white bg-gray-800 rounded shadow-lg">
                                  Structured search compares your input to sustainability guidelines using keyword and vector similarity. It's rule-based and deterministic.
                                </div>
                              )}
                              {type === "GenAI" && (
                                <div className="absolute right-6 bottom-8 hidden group-hover:block z-20 w-64 p-3 text-sm text-white bg-gray-800 rounded shadow-lg">
                                  GenAI search builds on existing sustainability guidelines by using generative AI to provide explanations, suggestions, and visual concepts. It's more creative but less predictable.
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  
                  {/* Output Type */}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold mb-2 text-green-900">Output Type</h2>
                    <div className="shadow-sm shadow-gray-400 bg-[#628395] rounded-xl p-4 text-white space-y-2">
                      {["Text", "Image"].map((outputType) => {
                        const isImage = outputType === "Image";
                        const isDisabled = isImage && formValues.searchType !== "GenAI";

                        return (
                          <div key={outputType} className="flex items-center space-x-3 relative group">
                            <input
                              type="checkbox"
                              name={outputType}
                              checked={formValues.outputTypes[outputType as "Text" | "Image"]}
                              disabled={isDisabled}
                              onChange={(e) =>
                                setFormValues((prev) => ({
                                  ...prev,
                                  outputTypes: {
                                    ...prev.outputTypes,
                                    [outputType]: e.target.checked,
                                  },
                                }))
                              }
                              className={`w-5 h-5 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            />
                            <span className={`text-sm ${isDisabled ? "opacity-50" : ""}`}>{outputType}</span>

                            {isDisabled && (
                              <div className="absolute left-6 bottom-full mb-2 hidden group-hover:block z-20 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg">
                                Image output is only available for GenAI search.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  </div>
              </div> 
            </div>
            {/* Search Button */}
            <div className="relative -top-8 pl-[85%]">
              <button 
                className={`shadow-sm shadow-gray-400 rounded-full px-6 py-2 w-max transition ${
                  isSubmitDisabled
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-900 text-white hover:bg-green-800"
                }`}
                onClick={() => !isSubmitDisabled && handleSubmit()}
                disabled={isSubmitDisabled}
              >
                Search
              </button>

              {isSubmitDisabled && (
                <div className="absolute bottom-full left-10 bottom-5 mb-2 hidden group-hover:block w-64 text-xs text-white bg-gray-800 rounded shadow-lg px-3 py-2 z-30">
                  Please enter a design brief or upload a sketch, select a search type, and choose at least one output type.
                </div>
              )}
            </div>
          </div>
        </div>

        
        {/* Right column content */}
        <div className="shadow-md shadow-gray-400 bg-[#FFFAEE] border border-[#FFFAEE] pr-5 pl-5 p-4 rounded-xl flex flex-col w-full md:w-1/2 space-y-4">
          {output && output.estimatedEmissions ? (
            <div className="text-right text-sm text-gray-700">
              <p><span className="font-semibold">Energy:</span> {output.estimatedEmissions.energyWh.toFixed(6)} Wh</p>
              <p><span className="font-semibold">CO₂:</span> {output.estimatedEmissions.emissionsGrams.toFixed(6)} g</p>
            </div>
          ) : (
            <div className="text-right text-sm text-gray-500">Submit to view energy usage</div>
          )}

          {/* Text Output Area*/}
         <h2 className="text-lg font-bold text-green-900">Design Suggestion</h2>
          <div className="shadow-sm shadow-gray-400 bg-gray-200 border border-[#476C81] border-[6px] rounded-xl pl-4 pr-4 items-center justify-center text-gray-800 w-full h-64 flex ">
            
            {formValues.outputTypes.Text ? (
              loading ? (
                <ClipLoader color="#2F4F4F" size={20} />
              ) : error ? (
                <p className="text-red-600 font-semibold">{error}</p>
              ) : (
                text || <p className="text-gray-400">Submit to receive design suggestion.</p>
              )
            ) : (
              <p className="text-gray-400">Text output not selected.</p>
            )}

          </div>

          {/* Image output area */}
          <h2 className="text-lg font-bold mb-2 text-green-900">Sketch Suggestion</h2>
          <div
            className={`shadow-sm shadow-gray-400 ${
              image ? "bg-white" : "bg-gray-200"
            } border border-[#476C81] border-[6px] p-4 rounded-xl text-center text-gray-800 w-full h-80 flex items-center justify-center`}
          >
                      
            {formValues.outputTypes.Image ? (
              loading ? (
                <ClipLoader color="#2F4F4F" size={20} />
              ) : error ? (
                <p className="text-red-600 font-semibold">{error}</p>
              ) : (
                image || <p className="text-gray-400">Submit to receive image.</p>
              )
            ) : (
              <p className="text-gray-400">Image output not selected.</p>
            )}

          </div>
        </div>
      </div>
    );
  }
