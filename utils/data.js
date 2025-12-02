import fs from "fs";
import { encrypt, decrypt } from "./encrypt.js";

const FILE = "./data.json";
let data = {};

if (fs.existsSync(FILE)) data = JSON.parse(fs.readFileSync(FILE));

export function saveData() {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function setUserKey(userId, key) {
  data[userId] = encrypt(key);
  saveData();
}

export function getUserKey(userId) {
  if (!data[userId]) return null;
  return decrypt(data[userId]);
}

export function removeUserKey(userId) {
  delete data[userId];
  saveData();
}