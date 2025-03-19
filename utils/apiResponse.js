import { encryptResponse } from "../middlewares/responseEncrypt.js";
export class ApiResponse {
  constructor(statusCode, data, message = "success") {
    this.statusCode = statusCode;
    this.data = encryptResponse(JSON.stringify(data));
    this.message = message;
    this.success = statusCode < 400;
  }
}
