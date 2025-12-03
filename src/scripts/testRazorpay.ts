import dotenv from "dotenv";

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID?.trim();
const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();

console.log(`Key ID: '${key_id}' (Length: ${key_id?.length})`);
console.log(`Key Secret Length: ${key_secret?.length}`);

if (!key_id || !key_secret) {
  console.error("Keys missing!");
  process.exit(1);
}

const auth = Buffer.from(`${key_id}:${key_secret}`).toString("base64");

interface FetchResponse {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json(): Promise<any>;
}

async function callApi(
  method: string,
  path: string,
  body?: unknown,
): Promise<void> {
  console.log(`\n--- Calling ${method} ${path} ---`);
  try {
    const response: FetchResponse = (await fetch(
      `https://api.razorpay.com/v1${path}`,
      {
        method,
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      },
    )) as FetchResponse;

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    console.error("Error:", error);
  }
}

import axios, { AxiosError } from "axios";

async function callApiAxios(
  method: string,
  path: string,
  body?: unknown,
): Promise<void> {
  console.log(`\n--- Calling Axios ${method} ${path} ---`);
  try {
    const response = await axios({
      method,
      url: `https://api.razorpay.com/v1${path}`,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      data: body,
    });

    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("Axios Error:", axiosError.message);
    if (axiosError.response) {
      console.error("Axios Response Status:", axiosError.response.status);
      console.error(
        "Axios Response Data:",
        JSON.stringify(axiosError.response.data, null, 2),
      );
    }
  }
}

async function runTests(): Promise<void> {
  await callApi("GET", "/methods");
  await callApiAxios("GET", "/methods");
  await callApiAxios("GET", "/plans");
}

runTests();
