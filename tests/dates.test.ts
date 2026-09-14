import assert from "node:assert/strict";
import test from "node:test";
import { formatDate, localDateInput } from "../src/lib/utils";

function inElSalvador(check: () => void) {
  const previous = process.env.TZ;
  process.env.TZ = "America/El_Salvador";
  try {
    check();
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
}

test("date-only records keep the recorded calendar day in El Salvador", () => {
  inElSalvador(() => {
    const expected = new Intl.DateTimeFormat("es-SV", { dateStyle: "medium" }).format(new Date(2026, 8, 13, 12));
    assert.equal(formatDate("2026-09-13"), expected);
    assert.equal(formatDate("2026-09-14T02:30:00Z"), expected);
  });
});

test("default form dates follow the local day during early UTC hours", () => {
  inElSalvador(() => {
    assert.equal(localDateInput(new Date("2026-09-14T02:30:00Z")), "2026-09-13");
    assert.equal(localDateInput(new Date("2027-01-01T02:30:00Z")), "2026-12-31");
    assert.equal(localDateInput(new Date("2026-09-14T06:00:00Z")), "2026-09-14");
  });
});
