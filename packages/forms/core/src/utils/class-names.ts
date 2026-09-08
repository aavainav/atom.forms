type ClassValue = string | boolean | undefined | null;

export function buildClasses(...classes: ClassValue[]): string {
    return classes.filter(Boolean).join(" ");
}