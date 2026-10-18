// Text the tests assert on, copied verbatim from ../client/src/i18n/vi.ts (the only place the game keeps visible
// strings, NFR-I18N-01). A copy change is fixed here, not in specs. Functions mirror vi.ts functions of the same name.

// vi.ts formatScore: Intl.NumberFormat("vi-VN") groups with "." (4.200).
const scoreFormat = new Intl.NumberFormat("vi-VN");
export const formatScore = (n: number): string => scoreFormat.format(n);

export const copy = {
  appTitle: "Duck Match",
  // Level map
  levelMapTitle: "Bản đồ màn",
  levelLabel: (id: number) => `Màn ${id}`,
  locked: "Chưa mở",
  bestScore: "Điểm cao nhất",
  noProgressYet: "Chưa có tiến độ",
  unlockHint: (previousLevel: number) => `Thắng màn ${previousLevel} để mở`,
  starGap: (points: string) => `Còn ${points} điểm nữa là thêm một sao`,
  productName: "Duck Match",
  productTagline: "Xếp 3 viên cùng hình để đạt mục tiêu của từng màn",
  productReassurance: "6 màn · chơi ngay trên trình duyệt · không đăng nhập, không mất phí",
  productReassuranceSignIn: "6 màn · chơi ngay trên trình duyệt · đăng nhập tuỳ chọn, không mất phí",
  loading: "Đang tải…",
  // Play HUD
  movesLeft: "Lượt",
  score: "Điểm",
  goals: "Mục tiêu",
  goalScoreShort: "Điểm",
  goalScore: (current: number, target: number) => `${formatScore(current)}/${formatScore(target)}`,
  goalCollect: (current: number, target: number) => `${current}/${target}`,
  goalScoreLabel: (current: number, target: number) => `Mục tiêu điểm ${formatScore(current)}/${formatScore(target)}`,
  goalCollectLabel: (colorName: string, current: number, target: number) =>
    `Mục tiêu viên ${colorName} ${current}/${target}`,
  // Restart confirm (FR-22)
  confirmRestartTitle: "Chơi lại từ đầu?",
  confirmRestartLoses: (score: string) => `Điểm ${score} của lượt chơi này sẽ mất và bàn được xếp lại từ đầu.`,
  confirmRestartKeeps: "Sao và điểm cao nhất bạn đã đạt ở màn này vẫn được giữ nguyên.",
  confirmRestartCancel: "Thôi, chơi tiếp",
  levelRestarted: "Đã xếp lại bàn từ đầu",
  // Result dialog
  replay: "Chơi lại",
  backToMap: "Về bản đồ",
  nextLevel: "Màn tiếp",
  won: "Thắng màn!",
  lost: "Hết lượt!",
  starsEarned: (stars: number, max: number) => `Đạt ${stars}/${max} sao`,
  lostKeepsProgress: "Sao và điểm cao nhất của bạn được giữ nguyên.",
  // Ducker ID
  accountSignIn: "Đăng nhập",
  accountMenuLabel: "Tài khoản Ducker ID",
  accountOpenProfile: "Mở hồ sơ Ducker ID",
  accountSignOut: "Đăng xuất",
  // Board a11y
  boardLabel: "Bàn",
  cellLabelPlain: (row: number, col: number, colorName: string) => `Ô hàng ${row + 1} cột ${col + 1}, viên ${colorName}`,
  reshuffled: "Đã xáo bàn",
  moveRejected: "Nước đi không hợp lệ — hai viên không tạo được hàng ba, lượt chưa bị trừ",
} as const;

// vi.ts SPECIAL_NAME (the words a cell label uses for a special piece).
export const specialName = {
  stripedH: "viên sọc ngang",
  stripedV: "viên sọc dọc",
  wrapped: "viên bom",
  colorBomb: "bom màu",
} as const;

// vi.ts COLOR_NAME and SHAPE_BY_COLOR.
export const colorName = {
  red: "đỏ",
  blue: "xanh dương",
  green: "xanh lá",
  yellow: "vàng",
  purple: "tím",
  orange: "cam",
} as const;

export const shapeByColor = {
  red: "circle",
  blue: "square",
  green: "triangle",
  yellow: "diamond",
  purple: "star",
  orange: "hexagon",
} as const;
