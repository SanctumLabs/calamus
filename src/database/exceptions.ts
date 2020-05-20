export abstract class DatabaseException extends Error {
  constructor(public message: string = 'db error') {
    super(message);
  }
}
