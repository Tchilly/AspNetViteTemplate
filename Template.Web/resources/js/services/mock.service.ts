export class MockService {
  getMessage(): string {
    return "Hello from MockService!";
  }
}

export interface MyServiceType {
  getMessage(): string;
}
