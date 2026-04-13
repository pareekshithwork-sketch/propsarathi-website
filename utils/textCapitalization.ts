export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const capitalizeSentences = (text: string): string => {
  if (!text) return text

  // Capitalize first letter of the entire text
  let result = text.charAt(0).toUpperCase() + text.slice(1)

  // Capitalize first letter after periods (sentences)
  result = result.replace(/\.\s+([a-z])/g, (match, letter) => {
    return `. ${letter.toUpperCase()}`
  })

  return result
}
