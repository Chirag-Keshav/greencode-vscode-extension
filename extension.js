const vscode = require("vscode");
const { co2, averageIntensity } = require("@tgwf/co2");
const https = require("https");

// Detect user location using IP geolocation API
async function detectLocation() {
  return new Promise((resolve, reject) => {
    https
      .get("https://ipapi.co/json/?key=fU7Wrk9dpM56Mmvbe74uhwiTViJAF0VSVY2rxgb2ICUH4pcRlM", (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const location = JSON.parse(data);
            //console.log("Raw location data:", location);
            
            resolve({
              country: location.country_name,
              countryCode: location.country_code,
              countryCodeISO3: location.country_code_iso3, // Direct ISO3 code!
              city: location.city,
              region: location.region,
            });
          } catch (error) {
            console.error("Parse error:", error);
            reject(new Error("Failed to parse location data"));
          }
        });
      })
      .on("error", (error) => {
        console.error("HTTP error:", error);
        reject(error);
      });
  });
}

// Get grid intensity from CO2.js built-in data
function getGridIntensity(countryCodeISO3) {
  try {
    //console.log("ISO3 Country code received:", countryCodeISO3);
    
    if (!countryCodeISO3) {
      console.log("No country code provided, using global average");
      return {
        intensity: 494,
        year: 2024,
        source: "Global Average (No location data)",
      };
    }
    
    const { data: gridData, type } = averageIntensity;
    //console.log("Grid data type:", type);
    //console.log("Grid data keys sample:", Object.keys(gridData).slice(0, 10));
    
    // Use the ISO3 code directly - no mapping needed!
    if (gridData[countryCodeISO3]) {
      //console.log("Found intensity for", countryCodeISO3, ":", gridData[countryCodeISO3]);
      return {
        intensity: gridData[countryCodeISO3],
        year: 2022, // Ember data year
        source: "Ember Climate (via CO2.js)",
      };
    }
    
    console.log("No data found for", countryCodeISO3, "- using global average");
  } catch (error) {
    console.error("Error in getGridIntensity:", error);
  }
  
  // Fallback to global average
  return {
    intensity: 494,
    year: 2024,
    source: "Global Average",
  };
}

// Cache location to avoid repeated API calls
let cachedLocation = null;

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.calculateCO2",
    async function () {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage("No active editor");
        return;
      }

      const selection = editor.selection;
      const code = editor.document.getText(selection);

      if (!code.trim()) {
        vscode.window.showWarningMessage("Select some code first!");
        return;
      }

      try {
        // Show loading message
        vscode.window.showInformationMessage("Detecting your location...");

        // Get location (use cache if available)
        if (!cachedLocation) {
          cachedLocation = await detectLocation();
          console.log("Location detected:", cachedLocation);
        }

        const bytes = Buffer.byteLength(code, "utf8");
        const gridData = getGridIntensity(cachedLocation.countryCodeISO3);
        const gridIntensity = gridData.intensity;

        // Create CO2 instance
        const co2Instance = new co2({
          model: "swd",
          version: 4,
        });

        // Calculate CO2 using country-specific grid intensity
        // Use perByteTrace to pass custom grid intensity
        const traceResult = co2Instance.perByteTrace(bytes, false, {
          gridIntensity: {
            device: gridIntensity,
            dataCenter: gridIntensity,
            network: gridIntensity,
          },
        });
        
        const co2Grams = traceResult.co2;

        // Calculate energy consumption (kWh)
        const energyKWh = (bytes / (1024 * 1024 * 1024)) * 0.194;

        // Format location string safely
        const locationStr = cachedLocation.city && cachedLocation.country 
          ? `${cachedLocation.city}, ${cachedLocation.country}`
          : cachedLocation.country || "Unknown Location";

        // Show results
        vscode.window.showInformationMessage(
          `🌍 CO₂ Emissions (${locationStr}):\n` +
            `• Total CO₂: ${co2Grams.toFixed(6)} g\n` +
            `• Grid Intensity: ${gridIntensity.toFixed(2)} gCO₂/kWh\n` +
            `• Energy: ${energyKWh.toFixed(8)} kWh\n` +
            `• Code Size: ${bytes} bytes\n` +
            `• Data Source: ${gridData.source} (${gridData.year})`
        );
      } catch (error) {
        console.error("Error in main flow:", error);
        vscode.window.showErrorMessage(
          `Error: ${error.message}. Using global average.`
        );

        // Fallback to global average
        try {
          const bytes = Buffer.byteLength(code, "utf8");
          const co2Instance = new co2({ model: "swd", version: 4 });
          const co2Grams = co2Instance.perByte(bytes);
          const energyKWh = (bytes / (1024 * 1024 * 1024)) * 0.194;

          vscode.window.showInformationMessage(
            `🌍 CO₂ Emissions (Global Average):\n` +
              `• Total CO₂: ${co2Grams.toFixed(6)} g\n` +
              `• Grid Intensity: 494.00 gCO₂/kWh\n` +
              `• Energy: ${energyKWh.toFixed(8)} kWh\n` +
              `• Code Size: ${bytes} bytes`
          );
        } catch (fallbackError) {
          vscode.window.showErrorMessage(
            `Critical error: ${fallbackError.message}`
          );
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {
  cachedLocation = null;
}

module.exports = {
  activate,
  deactivate,
};