import api from "../../core/api";

// Mock users for development
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "employee@example.com",
    password: "password123",
    role: "Employee",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "itmanager@example.com",
    password: "password123",
    role: "IT Manager",
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "Admin",
  },
];

export async function loginApi(email, password) {
  // Mock login - comment out actual API call
  // try {
  //   const response = await api.post("/auth/login", { email, password });
  //   return { success: true, data: response.data };
  // } catch (error) {
  //   return {
  //     success: false,
  //     message:
  //       error.response?.data?.message || "Login failed. Please try again.",
  //   };
  // }

  // Mock implementation
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (user) {
    return {
      success: true,
      data: {
        access_token: "mock_token",
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    };
  } else {
    return { success: false, message: "Invalid email or password." };
  }
}

export async function registerApi(name, email, password) {
  // Mock register - comment out actual API call
  // try {
  //   const response = await api.post("/auth/register", { name, email, password });
  //   return { success: true, data: response.data };
  // } catch (error) {
  //   return {
  //     success: false,
  //     message:
  //       error.response?.data?.message || "Registration failed. Please try again.",
  //   };
  // }

  // Mock implementation
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return { success: false, message: "An account with that email already exists." };
  }

  const newUser = {
    id: mockUsers.length + 1,
    name,
    email,
    role: "Employee"
  };
  mockUsers.push({ ...newUser, password }); // Add to mock users

  return {
    success: true,
    data: {
      access_token: "mock_token",
      user: newUser
    }
  };
}
