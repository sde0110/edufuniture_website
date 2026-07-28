export function sanitizePhoneNumber(value:string){const trimmed=value.trim(),plus=trimmed.startsWith("+"),digits=trimmed.replace(/\D/g,"");return plus?`+${digits}`:digits}
export function maskPhoneNumber(value:string){const clean=sanitizePhoneNumber(value),prefix=clean.startsWith("+")?"+":"",digits=clean.replace(/\D/g,"");if(digits.length<7)return `${prefix}${digits}`;return `${prefix}${digits.slice(0,3)}-${digits.slice(3,5)}••-••${digits.slice(-2)}`}
export function validateFinalAnswer(value:string){return value.normalize("NFC").replace(/\s/g,"")==="기억하지"}
export function addUniqueItem(items:string[],item:string){return items.includes(item)?items:[...items,item]}
export function evaluateCondition(completed:number[],roomId:number){return roomId===1||completed.includes(roomId-1)}
export function createLetterBlob(text:string){return new Blob([text],{type:"text/plain;charset=utf-8"})}
