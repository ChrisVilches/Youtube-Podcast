interface Message {
  message: string
}

export const messageResponse = (message: string): Message => ({ message })
