export enum SocketEmitEvent {
  SOCKET_ERROR = 'socket_error',
  /** Room */
  PLAYER_JOIN = 'player-join',
  PLAYER_DEFAULT_BET = 'player-default-bet',
  PLAYER_LEAVE_ROOM = 'player-leave-room',
  SKIP_HOST = 'skip-host',
  /** Game */
  START_GAME = 'start-game',
  BET_COUNTDOWN = 'bet-countdown',
  SET_BET = 'set-bet',
  DECIDE_COUNTDOWN = 'decide-countdown',
  DECIDE = 'decide',
  RESULT = 'result',
  SKIP_GAME = 'skip-game',
  NOT_CONTINUE_GAME = 'not-continue-game',
  /** Auto play */
  AUTO_PLAY = 'auto-play',
  /** Chat */
  SEND_MESSAGE = 'send-message'
}

export enum SocketSubscribeEvent {
  /** Room */
  JOIN_ROOM = 'join-room',
  JOIN_RANDOM = 'join-random',
  CREATE_ROOM = 'create-room',
  PLAYER_DEFAULT_BET = 'player-default-bet',
  LEAVE_ROOM = 'leave-room',
  SKIP_HOST = 'skip-host',
  /** Game */
  START_GAME = 'start-game',
  SET_BET = 'set-bet',
  DECIDE = 'decide',
  SKIP_GAME = 'skip-game',
  /** Auto play */
  AUTO_PLAY = 'auto-play',
  /** Chat */
  SEND_MESSAGE = 'send-message'
}
