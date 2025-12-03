const key_id = "rzp_test_Kd2jgkU50IYiC7";
const key_secret = "Q9kSmsTkiO8bSVRNJzdvbY8M";

const auth = Buffer.from(`${key_id}:${key_secret}`).toString("base64");

console.log("\nCopy and run this command exactly:");
console.log(
  `curl.exe -H "Authorization: Basic ${auth}" https://api.razorpay.com/v1/methods`,
);
