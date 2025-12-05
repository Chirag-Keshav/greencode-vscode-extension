# GreenCode CO2 Calculator

Calculate the carbon footprint of your code snippets in real-time!

## Features

- 🌍 **Location-Based Calculations**: Automatically detects your region and uses local grid carbon intensity
- ⚡ **Real-Time Emissions**: Instant CO2 calculations for selected code
- 📊 **Detailed Metrics**: Shows CO2 (grams), energy (kWh), and data size
- 🌱 **Sustainable Web Design Model**: Uses industry-standard v4 model from The Green Web Foundation

## Usage

1. Select any code snippet in your editor
2. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac)
3. Type "Calculate CO2 for Selected Code"
4. View your code's environmental impact!

## Example Output
```
🌍 CO₂ Emissions (Coimbatore, India):
- Total CO₂: 0.000147 g
- Grid Intensity: 632.00 gCO₂/kWh
- Energy: 0.00000012 kWh
- Code Size: 256 bytes
- Data Source: Ember Climate (via CO2.js) (2022)
```

## Requirements

- Active internet connection for location detection
- VS Code 1.106.1 or higher

## How It Works

This extension uses:
- **CO2.js** from The Green Web Foundation for carbon calculations
- **Sustainable Web Design Model v4** for accurate emissions estimation
- **IP geolocation** to determine your region's grid carbon intensity
- **Ember Climate data** for country-specific electricity emissions factors

## Privacy

Your IP address is used only to determine your approximate location for grid intensity calculations. No data is stored or transmitted beyond the geolocation API call.

## Contributing

Found a bug or want to contribute? Visit the [GitHub repository](https://github.com/Chirag-Keshav/greencode-vscode-extension).

## License

MIT

## Credits

- Built with [CO2.js](https://github.com/thegreenwebfoundation/co2.js)
- Data from [The Green Web Foundation](https://www.thegreenwebfoundation.org/)
- Grid intensity data from [Ember Climate](https://ember-climate.org/)
- Location data from [IP API](https://ipapi.co)

MIT License

Copyright (c) 2024 Chirag Keshav
