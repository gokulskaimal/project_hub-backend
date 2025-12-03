import dotenv from "dotenv";

dotenv.config();

function inspectString(label: string, str?: string) {
  if (!str) {
    console.log(`${label}: <UNDEFINED>`);
    return;
  }
  console.log(`${label}: "${str}" (Length: ${str.length})`);
  console.log("  Char Codes:");
  for (let i = 0; i < str.length; i++) {
    console.log(`    [${i}] ${str[i]} -> ${str.charCodeAt(i)}`);
  }
}

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

console.log("--- Inspecting Keys ---");
inspectString("RAZORPAY_KEY_ID", key_id);
inspectString("RAZORPAY_KEY_SECRET", key_secret);
