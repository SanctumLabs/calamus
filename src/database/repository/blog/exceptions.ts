import { DatabaseException } from '@database/exceptions';

export class BlogDBException extends DatabaseException {
  constructor(message = 'Blog DB exception') {
    super(message);
  }
}
