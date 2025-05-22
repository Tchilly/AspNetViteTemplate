/**
 * MockService.ts
 * This file contains the definition of the MockService class.
 * It is used to demonstrate service resolution and interaction within the application.
 * The service provides a simple method to return a message.
 */
export interface MyServiceType {
  getMessage(): string;
}

export class MockService {
  getMessage(): string {
    return "Hello from MockService!";
  }
}
