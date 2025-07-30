import { VercelRequest, VercelResponse } from "@vercel/node";
import { HealthCheckResponse } from "../src/interfaces/ApiResponse";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Only allow GET method
  if (req.method !== "GET") {
    const errorResponse: HealthCheckResponse = {
      status: "error",
      timestamp: new Date().toISOString(),
    };
    return res.status(405).json(errorResponse);
  }

  try {
    const healthResponse: HealthCheckResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
    };

    return res.status(200).json(healthResponse);
  } catch (error) {
    const errorResponse: HealthCheckResponse = {
      status: "error",
      timestamp: new Date().toISOString(),
    };

    return res.status(500).json(errorResponse);
  }
}
