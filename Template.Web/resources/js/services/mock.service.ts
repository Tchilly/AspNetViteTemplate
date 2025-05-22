/**
 * MockService.ts
 * This file contains the definition of the MockService class.
 * It is used to demonstrate service resolution and interaction within the application.
 * The service provides a simple method to return a message.
 */
export interface MyServiceType {
  getMessage(): string;
  performAction(): void;
}

export class MockService implements MyServiceType {
  getMessage(): string {
    return "Hello from MockService!";
  }

  performAction(): void {
    console.log("MockService action performed: Button was clicked!");
  }
}
