import { DateTime } from 'luxon';

export function getLocalDateAndTime(utcIsoString: string): string {
  return DateTime.fromISO(utcIsoString).toLocal().toFormat('dd-MM-yyyy t')
}

export function getDiffBetweenNowAndDate(utcIsoString: string): {
  //ui display
  shortValue: string
  //everything
  hintValue: string
}{
  const dt = DateTime.fromISO(utcIsoString).toLocal();
  const diff = DateTime.now().diff(dt, ["hours", "minutes", 'days', 'months', 'years', 'weeks']).toObject();

  const hours = Math.floor(diff.hours ?? 0);
  const minutes = Math.floor(diff.minutes ?? 0);
  const days = Math.floor(diff.days ?? 0)
  const weeks = Math.floor(diff.weeks ?? 0)
  const months = Math.floor(diff.months ?? 0)
  const years = Math.floor(diff.years ?? 0)

  let finalShort = ''
  if(minutes < 60 && hours < 24){
    finalShort = `${minutes.toFixed(2)}mi ${hours.toFixed(2)}h`
  } else  if(hours >= 24 && days < 3){
    // if within a few of days show days and hours
    finalShort = `${days?.toFixed(1)}d ${hours.toFixed(1)}h`
  } else if(days >= 3 && weeks < 2){
    // if within a couple of weeks show days and weeks
    finalShort = `${days.toFixed(1)}d ${weeks.toFixed(1)}w`
  } else if(weeks >= 2 && months < 2){
    //if after a couple of weeks but less than 2 months
    finalShort = `${weeks.toFixed(1)}w ${months.toFixed(1)}mo`
  } else if(months >= 2 && years < 1){
    //if after a couple of months but less than a year
    finalShort = `${months.toFixed(1)}mo ${years.toFixed(1)}y`
  }

  let hintFinal = `${minutes.toFixed(1)}m`
  if(minutes >= 60 && hours > 1){
    hintFinal += ` ${hours.toFixed(1)}h`
  }
  if(days > 1){
    hintFinal += ` ${days.toFixed(1)}d`
  }
  if(weeks > 1){
    hintFinal += `\r\n${weeks.toFixed(1)}w`
  }
  if(months > 1){
    hintFinal += ` ${months.toFixed(1)}mo`
  }
  if(years > 1){
    hintFinal += ` ${years.toFixed(1)}yr`
  }
  
  const hintValue = `${hintFinal}\r\nago`
  const shortValue = `${finalShort} ago`
  
  return {
    shortValue,
    hintValue
  }
}