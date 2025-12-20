"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAttendance = exports.registerForEvent = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Admin SDK once
admin.initializeApp();
// Export Controllers
var registration_1 = require("./controllers/registration");
Object.defineProperty(exports, "registerForEvent", { enumerable: true, get: function () { return registration_1.registerForEvent; } });
var attendance_1 = require("./controllers/attendance");
Object.defineProperty(exports, "verifyAttendance", { enumerable: true, get: function () { return attendance_1.verifyAttendance; } });
// Add other separate function files here as needed
//# sourceMappingURL=index.js.map