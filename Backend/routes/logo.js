const express = require("express");
const axios = require("axios");

const router = express.Router();

// Get logo from URL
router.post("/fetch", async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    // Extract domain from URL
    let domain;
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      domain = urlObj.hostname.replace("www.", "");
    } catch (error) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    // Try multiple logo sources
    const logoUrls = [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      `https://logo.clearbit.com/${domain}`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`
    ];

    // Try first logo source (Google favicons - most reliable)
    try {
      const response = await axios.get(logoUrls[0], { 
        responseType: "arraybuffer",
        timeout: 5000 
      });
      
      if (response.status === 200) {
        const base64 = Buffer.from(response.data).toString("base64");
        const mimeType = response.headers["content-type"] || "image/png";
        return res.json({ 
          logo: `data:${mimeType};base64,${base64}`,
          source: "google"
        });
      }
    } catch (error) {
      // Try next source
    }

    // Try Clearbit
    try {
      const response = await axios.get(logoUrls[1], { 
        responseType: "arraybuffer",
        timeout: 5000 
      });
      
      if (response.status === 200) {
        const base64 = Buffer.from(response.data).toString("base64");
        return res.json({ 
          logo: `data:image/png;base64,${base64}`,
          source: "clearbit"
        });
      }
    } catch (error) {
      // Try next source
    }

    // Try DuckDuckGo
    try {
      const response = await axios.get(logoUrls[2], { 
        responseType: "arraybuffer",
        timeout: 5000 
      });
      
      if (response.status === 200) {
        const base64 = Buffer.from(response.data).toString("base64");
        return res.json({ 
          logo: `data:image/x-icon;base64,${base64}`,
          source: "duckduckgo"
        });
      }
    } catch (error) {
      // No logo found
    }

    // Return default logo option
    res.json({ 
      logo: null,
      message: "No logo found. Please upload a custom logo.",
      domain 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

