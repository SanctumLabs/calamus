export class JwtException extends Error {
    constructor(public message: string = 'JWT Error') {
        super(message);
    }
}