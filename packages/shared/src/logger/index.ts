import pino from 'pino'

const isDev = process.env.NODE_ENV !== 'production'

export const logger = pino({
    level: isDev ? "debug" : "info",
    ...(isDev && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:HH:MM:ss",
                ignore: "pid,hostname",
                messageFormat: "{msg}",
            },
        },
    }),
    ...(!isDev && {
        formatters: {
            level(label) {
                return { level: label };
            },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
    }),
});

export type Logger = typeof logger;