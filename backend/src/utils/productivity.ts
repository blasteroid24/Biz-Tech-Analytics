export interface ProductivityMetrics {
    totalActiveTimeMins: number;
    utilizationPercent: number;
    throughput: number;
    totalProducts: number;
}

export const calculateProductivity = (events: any[], totalShiftHours: number = 24): ProductivityMetrics => {
    if (!events.length) return { totalActiveTimeMins: 0, utilizationPercent: 0, throughput: 0, totalProducts: 0 };

    const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let totalActiveMins = 0;
    let totalProducts = 0;

    for (let i = 0; i < sortedEvents.length; i++) {
        const current = sortedEvents[i];
        
        if (current.eventType === 'product_count') {
            totalProducts += (current.count || 0);
            continue;
        }

        if (current.eventType === 'working') {
            const startTime = new Date(current.timestamp).getTime();

            let nextStateEvent = null;
            for (let j = i + 1; j < sortedEvents.length; j++) {
                if (['working', 'idle', 'absent'].includes(sortedEvents[j].eventType)) {
                    nextStateEvent = sortedEvents[j];
                    break;
                }
            }

            const endTime = nextStateEvent ? new Date(nextStateEvent.timestamp).getTime() : new Date().getTime();
            const diffMins = (endTime - startTime) / (1000 * 60);
            totalActiveMins += Math.max(0, diffMins);
        }
    }

    const utilization = (totalActiveMins / (totalShiftHours * 60)) * 100;
    const throughput = totalActiveMins > 0 ? (totalProducts / (totalActiveMins / 60)) : 0;

    return {
        totalActiveTimeMins: Math.round(totalActiveMins),
        utilizationPercent: Math.round(utilization * 100) / 100,
        throughput: Math.round(throughput * 100) / 100,
        totalProducts
    };
};
