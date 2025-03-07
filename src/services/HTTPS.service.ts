import axios from "axios";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const HTTPS = axios.create({
  // Internal API URL
  baseURL: `${BASE_URL}/api`,
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default HTTPS;
