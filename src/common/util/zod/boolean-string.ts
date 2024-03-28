export const booleanString = (u: unknown) => {
  if (u === 'true') return true
  if (u === 'false') return false
  return undefined
}
