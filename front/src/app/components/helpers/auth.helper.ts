export class AuthHelper {
    static checkPasswordFormat(password: string): boolean {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\[\]\-_=+{}|;:',.<>?/]).{8,}$/.test(password);
    }
}