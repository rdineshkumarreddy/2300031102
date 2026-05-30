const TYPE_WEIGHTS = {
  placement: 3,
  result: 2,
  event: 1
};

function sortNotifications(list) {
  const scored = list.map(item => {
    const typeKey = (item.Type || item.type || '').toLowerCase();
    const weight = TYPE_WEIGHTS[typeKey] || 0;
    
    const tsString = item.Timestamp || item.timestamp;
    const parsedTime = tsString ? new Date(tsString).getTime() : 0;

    return {
      item,
      weight,
      time: parsedTime
    };
  });

  scored.sort((a, b) => {
    if (b.weight !== a.weight) {
      return b.weight - a.weight;
    }
    return b.time - a.time;
  });

  return scored.slice(0, 10).map(x => x.item);
}

const input = [
  { ID: "1", Type: "Event", Timestamp: "2026-04-20 10:00:00", Message: "E1" },
  { ID: "2", Type: "Placement", Timestamp: "2026-04-21 12:00:00", Message: "P1" },
  { ID: "3", Type: "Result", Timestamp: "2026-04-22 15:00:00", Message: "R1" },
  { ID: "4", Type: "Placement", Timestamp: "2026-04-23 09:00:00", Message: "P2" },
  { ID: "5", Type: "Event", Timestamp: "2026-04-24 18:00:00", Message: "E2" },
  { ID: "6", Type: "Result", Timestamp: "2026-04-19 11:00:00", Message: "R2" }
];

const sorted = sortNotifications(input);

const expectedOrder = ["4", "2", "3", "6", "5", "1"];
const actualOrder = sorted.map(x => x.ID);

const pass = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);
if (pass) {
  process.stdout.write("[PASS] Notification Priority Sorting Logic Test\n");
} else {
  process.stderr.write(`[FAIL] Expected: ${JSON.stringify(expectedOrder)}, Got: ${JSON.stringify(actualOrder)}\n`);
  process.exit(1);
}
