/** Keys */
export const userKey = (_id: string) => `user:${_id}`
export const roomKey = (_id: string) => `room:${_id}`
export const roomPlayerKey = (_id: string) => `${roomKey(_id)}:player`
// export const lockHostField = (roomId: string, hostId: string) =>
//   `lockHost:${roomId}:${hostId}`
export const userAutoPlayKey = (userId: string) => `autoPlay:${userId}`
