import { toast } from 'ngx-sonner';

export class ToastWrapper {
    public static success(message: string): void {
        toast.success(message);
    }

    public static error(message: string, description: string | null): void {
        if (!description) {
            toast.error(message);
        } else {
            toast.error(message, {
                description: description!
            });
        }
    }

    public static info(message: string): void {
        toast.info(message);
    }
}