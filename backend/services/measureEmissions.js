

//Local structured engine (dynamic, based on time)
export function measureStructuredEmissions(startTime, powerWatts=30) {
    const endTime = process.hrtime(startTime);
    const durationSec = endTime[0] + endTime[1] / 1e9;
    const durationHours = durationSec/3600;

    const energyWh = durationHours * powerWatts;
    const co2PerWh = 0.09; //Based on CA local grid energy usage
    const emissionsGrams = energyWh * co2PerWh;

    return {energyWh, emissionsGrams}

}


//OpenAI suggestion generation (static estimate)
export function measureOpenAIEmissions(model = "gpt-4o", numPrompts = 1) {
  const modelEnergy = {
    "gpt-4o": 0.42,        // Wh per prompt
    "gpt-4.1-mini": 0.42   // (e.g. image-to-text conversion)
  };

  const energy = modelEnergy[model] * numPrompts;
  const emissionsGrams = energy * 0.09;

  return { energyWh: energy, emissionsGrams };
}

//Replicate image generation (static estimate)
export function measureReplicateEmissions(numImages = 1) {
  const energyPerImage = 4.0; // Wh per image (Flux 1.1 Pro approx)
  const energy = energyPerImage * numImages;
  const emissionsGrams = energy * 0.09;

  return { energyWh: energy, emissionsGrams };
}

//Helper to sum two emissions objects
export function addEmissions(e1, e2) {
  return {
    energyWh: (e1?.energyWh || 0) + (e2?.energyWh || 0),
    emissionsGrams: (e1?.emissionsGrams || 0) + (e2?.emissionsGrams || 0)
  };
}
