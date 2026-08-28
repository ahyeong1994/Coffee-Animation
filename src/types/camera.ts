export type PhotoPhase =
  | 'idle'
  | 'printing'
  | 'waitingForShake'
  | 'shaking'
  | 'revealing'
  | 'readyToSave'
  | 'saving';
