// Silence dotenvx noise
process.env.DOTENVX_SILENT = "true";

import { jest } from "@jest/globals";

//
// ---------------------------------------------
// 1. ALL REQUIRED MOCKS BEFORE IMPORTING APP
// ---------------------------------------------
//

// Mock verifySession to inject req.user.id
jest.unstable_mockModule("../middleware/verifySession.js", () => ({
  default: (req, res, next) => {
    req.user = { id: "test-user-id" };
    next();
  }
}));

// Mock logger
jest.unstable_mockModule("../config/logger.js", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  }
}));

// Mock handleServerError
jest.unstable_mockModule("../utils/handleError.js", () => ({
  default: (res, err, message) => {
    return res.status(500).json({ success: false, message });
  }
}));

// Mock userModel.deleteUser and others
jest.unstable_mockModule("../src/model/userModel.js", () => ({
  findById: jest.fn(async () => ({
    id: "test-user-id",
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com"
  })),

  checkPasswordType: jest.fn(async () => "PASSWORD"),

  getUserCreds: jest.fn(async () => "$2b$12$HASHEDPASSWORD"),

  updateUser: jest.fn(async () => ({
    id: "test-user-id",
    firstname: "Updated",
    lastname: "User"
  })),

  deleteUser: jest.fn(async () => true),

  changeUserPassword: jest.fn(async () => ({
    id: "test-user-id",
    password: "newHashedPassword"
  }))
}));

// Mock userService functions
jest.unstable_mockModule("../src/service/userService.js", () => ({
  getUserById: jest.fn(async () => ({
    id: "test-user-id",
    firstname: "John",
    lastname: "Doe"
  })),

  checkPasswordService: jest.fn((req, res) =>
    res.status(200).json({ message: "Password matched" })
  ),

  changePasswordService: jest.fn((req, res) =>
    res.status(201).json({ message: "Password changed" })
  ),

  updateUserService: jest.fn((req, res) =>
    res.status(200).json({ message: "User updated" })
  ),

  checkPasswordTypeService: jest.fn((req, res) =>
    res.status(200).json({ message: "PASSWORD" })
  )
}));

// Mock Redis to prevent real connections
jest.unstable_mockModule("../config/redisConnection.js", () => ({
  getRedisClient: async () => ({
    connect: async () => {},
    disconnect: async () => {},
    on: () => {}
  })
}));

// Mock DB to prevent PG connections
jest.unstable_mockModule("../config/db.js", () => ({
  db: jest.fn(async () => ({ rows: [] })),
  pgQuery: jest.fn(async () => ({ rows: [] })),
  pool: { end: jest.fn() },
  pgConnectTest: jest.fn(async () => true),
}));

// Mock helmet
jest.unstable_mockModule("../config/helmet.config.js", () => ({
  helmetConfig: (req, res, next) => next()
}));

// Mock compression/cookie-parser/morgan
jest.unstable_mockModule("compression", () => ({
  default: () => (req, res, next) => next()
}));
jest.unstable_mockModule("cookie-parser", () => ({
  default: () => (req, res, next) => next()
}));
// jest.unstable_mockModule("morgan", () => ({
//   default: () => (req, res, next) => next()
// }));


// ---------------------------------------------
// 2. IMPORT APP AFTER ALL MOCKS
// ---------------------------------------------
const { app } = await import("../index.js");
import request from "supertest";


// ---------------------------------------------
// 3. TEST SUITE
// ---------------------------------------------
describe("USER SERVICE API", () => {

  it("GET /api/v1/user should return user details", async () => {
    const res = await request(app).get("/api/v1/user");
    expect(res.status).toBe(200);
    expect(res.body.result.id).toBe("test-user-id");
  });

  it("GET /api/v1/user/password-type should return PASSWORD", async () => {
    const res = await request(app).get("/api/v1/user/password-type");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("PASSWORD");
  });

  it("DELETE /api/v1/user/delete-user should delete user", async () => {
    const res = await request(app).delete("/api/v1/user/delete-user");
    expect(res.status).toBe(200);
  });

  it("PUT /api/v1/user/update-user should update user", async () => {
    const res = await request(app)
      .put("/api/v1/user/update-user")
      .send({ firstname: "New" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User updated");
  });

  it("POST /api/v1/user/check-password should verify password", async () => {
    const res = await request(app)
      .post("/api/v1/user/check-password")
      .send({ password: "12345678" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password matched");
  });

  it("PUT /api/v1/user/change-password should change password", async () => {
    const res = await request(app)
      .put("/api/v1/user/change-password")
      .send({
        oldPassword: "oldPass",
        newPassword: "newPass"
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Password changed");
  });

});