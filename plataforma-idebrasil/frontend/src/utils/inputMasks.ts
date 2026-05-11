export const onlyDigits = (value: string = ''): string => value.replace(/\D/g, '');

export const normalizeEmail = (value: string = ''): string =>
  value.replace(/\s+/g, '').toLowerCase();

export const normalizeText = (value: string = ''): string =>
  value.replace(/\s+/g, ' ').trimStart();

export const normalizeName = (value: string = ''): string => {
  const preservedUppercaseWords = new Set(['idebrasil', 'mei', 'ltda', 'sa']);

  const clean = value
    .replace(/[^A-Za-zÀ-ÿ\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .trimStart();

  return clean
    .split(' ')
    .map((word) => {
      if (!word) return '';
      if (preservedUppercaseWords.has(word.toLowerCase())) {
        return word.toUpperCase();
      }
      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(' ');
};

export const maskCPF = (value: string = ''): string => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

export const maskCNPJ = (value: string = ''): string => {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
};

export const maskCpfCnpj = (value: string = ''): string => {
  const digits = onlyDigits(value);
  return digits.length > 11 ? maskCNPJ(digits) : maskCPF(digits);
};

export const maskPhoneBR = (value: string = ''): string => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const maskCEP = (value: string = ''): string => {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
};
