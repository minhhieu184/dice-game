export const scramble = (data: string | number) => {
  const str = data.toString().split('')
  let currentIndex = str.length

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * str.length)
    currentIndex--
    ;[str[currentIndex], str[randomIndex]] = [str[randomIndex], str[currentIndex]]
  }

  return str.join('')
}
