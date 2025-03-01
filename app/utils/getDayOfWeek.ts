 export default function getDayOfWeek(date: Date, dayIndex: number) {
    const newDate = new Date(date);
    const currentDay = newDate.getDay() === 0 ? 7 : newDate.getDay(); 
    newDate.setDate(newDate.getDate() - currentDay + (dayIndex + 1));
  
    const day = newDate.getDate();
    const monthNames = [
      'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
      'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'
    ];
    const month = monthNames[newDate.getMonth()];
  
    return `${day} ${month}`;
  };