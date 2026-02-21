import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "10s", target: 5 },
    { duration: "20s", target: 5 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.1"],
  },
};

const BASE_URL = "http://localhost:8080";

const testFileContent = "This is a test file for k6 upload test.";

export function setup() {
  const email = `k6-${Date.now()}@test.com`;
  const res = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({ email, password: "password123" }),
    { headers: { "Content-Type": "application/json" } },
  );
  return { token: res.json("token") };
}

export default function (data) {
  const uploadRes = http.post(
    `${BASE_URL}/api/files`,
    {
      file: http.file(testFileContent, "test-file.txt", "text/plain"),
      expirationDays: "7",
    },
    {
      headers: { Authorization: `Bearer ${data.token}` },
    },
  );

  check(uploadRes, {
    "status est 201": (r) => r.status === 201,
    "retourne un token": (r) => r.json("token") !== undefined,
    "retourne le nom du fichier": (r) => r.json("name") === "test-file.txt",
  });

  sleep(1);
}
