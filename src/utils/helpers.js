export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  })
}

export const calcDuration = (from, to) => {
  const diff = (new Date(to) - new Date(from)) / 1000 / 60 / 60
  return Math.max(0, diff).toFixed(1)
}

export const calcTotal = (hours, pricePerHour) => {
  return (hours * pricePerHour).toFixed(2)
}

