const PRIORITY_STYLES = {
    high: 'bg-[#FDEBE3] text-[#8A3B1B]',
    medium: 'bg-primary-tint text-primary',
    low: 'bg-[#ECEAE5] text-[#4A5160]',
} as const;

export function priorityClass(priority: string) {
    return PRIORITY_STYLES[priority as keyof typeof PRIORITY_STYLES] ?? PRIORITY_STYLES.low;
}