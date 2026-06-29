export type DateRangeValidationResult =
  | { ok: true; from: string; to: string }
  | { ok: false; message: string };

// Limites reales del dataset Olist cargado en el proyecto. Validar esto en el
// borde HTTP evita consultas vacias o rangos fuera de la prueba tecnica.
const DATASET_MIN_DATE = "2016-01-01";
const DATASET_MAX_DATE = "2018-12-31";

export function validateDateRange(
  from: unknown,
  to: unknown,
): DateRangeValidationResult {
  if (!from || !to) {
    return { ok: false, message: "from and to query params are required" };
  }

  const fromValue = String(from);
  const toValue = String(to);

  // Primero se valida el formato textual que espera la API: YYYY-MM-DD.
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(fromValue) || !dateRegex.test(toValue)) {
    return { ok: false, message: "from and to must use YYYY-MM-DD format" };
  }

  // Se parsea en UTC para que la zona horaria local no cambie el dia evaluado.
  const fromDate = new Date(`${fromValue}T00:00:00Z`);
  const toDate = new Date(`${toValue}T00:00:00Z`);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return { ok: false, message: "from and to must be valid dates" };
  }

  if (fromDate > toDate) {
    return { ok: false, message: "from must be before or equal to to" };
  }

  const minDate = new Date(`${DATASET_MIN_DATE}T00:00:00Z`);
  const maxDate = new Date(`${DATASET_MAX_DATE}T00:00:00Z`);

  if (fromDate < minDate || toDate > maxDate) {
    return {
      ok: false,
      message: `date range must be between ${DATASET_MIN_DATE} and ${DATASET_MAX_DATE}`,
    };
  }

  return {
    ok: true,
    from: fromValue,
    to: toValue,
  };
}
