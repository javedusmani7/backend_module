import client from '../utils/redis.js';

export const TimeForSchedule = {
    SECONDS: 'seconds',
    MINUTES: 'minutes',
    HOURS: 'hours',
    DAYS: 'days',
    MONTHS: 'months'
};

const convertToMilliseconds = (interval, type) => {
    switch (type) {
        case TimeForSchedule.SECONDS:
            return interval * 1000;
        case TimeForSchedule.MINUTES:
            return interval * 60 * 1000;
        case TimeForSchedule.HOURS:
            return interval * 60 * 60 * 1000;
        case TimeForSchedule.DAYS:
            return interval * 24 * 60 * 60 * 1000;
        case TimeForSchedule.MONTHS:
            return interval * 30 * 24 * 60 * 60 * 1000;
        default:
            throw new Error('Invalid time type');
    }
};

const handleExecutionTiming = async (fun, redisKey, milliseconds) => {
    let lastExecutionTime = await client.get(redisKey);
    const currentTime = Date.now();

    if (!lastExecutionTime) {
        lastExecutionTime = await client.set(redisKey, currentTime);
    } 
        lastExecutionTime = parseInt(lastExecutionTime, 10);
        const elapsedTime = currentTime - lastExecutionTime;
        const adjustedDelay = Math.max(0, milliseconds - elapsedTime);

        setTimeout(async () => {
            await fun();
            await client.set(redisKey, Date.now());
            startInterval(fun, redisKey, milliseconds);
        }, adjustedDelay);

};

const startInterval = (fun, redisKey, milliseconds) => {
    const intervalId = setInterval(async () => {
        try {
            await fun();
            await client.set(redisKey, Date.now());
        } catch (error) {
            console.error('Error executing scheduled function:', error);
        }
    }, milliseconds);
    
    return () => clearInterval(intervalId);
};

export const scheduleJob = async (fun, interval, type, jobName) => {
    if (typeof fun !== 'function') {
        throw new Error('First argument must be a function');
    }

    if (typeof interval !== 'number' || interval <= 0) {
        throw new Error('Interval must be a positive number');
    }

    if (!jobName || typeof jobName !== 'string') {
        throw new Error('Job name must be a valid string');
    }

    const milliseconds = convertToMilliseconds(interval, type);
    const redisKey = `schedule:${jobName}`;

    await handleExecutionTiming(fun, redisKey, milliseconds);
};
