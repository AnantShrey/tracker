export const todayISO = () => new Date().toISOString().slice(0, 10);
export const localDateISO = (date = new Date()) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
};
export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');
