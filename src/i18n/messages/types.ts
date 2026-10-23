import type { en } from './en';

export type MessageKey = keyof typeof en;
export type Messages = Readonly<Record<MessageKey, string>>;
