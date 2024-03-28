export const joinRoomLockKey = (userId: string) => `joinRoomLockKey:${userId}`
export const startGameLockKey = (roomId: string) => `startGameLockKey:${roomId}`
export const decideLockKey = (userId: string) => `decideLockKey:${userId}`
export const defaultBetLockKey = (userId: string) => `defaultBetLockKey:${userId}`
export const roomLockKey = (roomId: string) => `roomLockKey:${roomId}`
export const skipHostLockKey = (roomId: string) => `skipHostLockKey:${roomId}`
export const newGameLockKey = (roomId: string) => `newGameLockKey:${roomId}`
export const autoPlayLockKey = (userId: string) => `autoPlayLockKey:${userId}`
