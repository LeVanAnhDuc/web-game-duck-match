# Duck Match — UX persona review · 2026-09-11

> 7 phiên · 7 persona · 5 Red Route
> Công cụ trình duyệt: Playwright (hạng 1) — chạy tuần tự thay vì song song, xem §Ghi chú
> Red route chốt ngày: 2026-09-11
> Đích đo: bản deploy GitHub Pages dựng từ `main` (`https://levananhduc.github.io/web-game-duck-match/`) — đúng thứ người chơi thật mở.

## Ấn tượng đầu

Tính trên toàn bộ persona — ấn tượng đầu chỉ xảy ra một lần.

| Thước | Kết quả |
| --- | --- |
| Đoán đúng đây là trang gì | **6/7** — sáu người nhận ra ngay "game giải đố xếp 3 chia màn" chỉ từ lưới thẻ "Màn 1…Màn 6". Người thứ bảy (p07 Ông Tám) chỉ đoán được tới mức "cái trò chơi gì đó có nhiều màn", và sau khi chơi xong vẫn nói "giờ ông vẫn không hiểu đây là trò gì rõ ràng" |
| Dám nhập email | **0/7** — không một ai trả lời "có". 5/7 nói thẳng là sẽ ngần ngại; 2 người còn lại (p01, p02) chỉ nói "không bị hỏi nên chưa phải lo", không ai nói sẽ nhập |
| Lý do người không dám | Năm người, năm cách nói, cùng một nguyên nhân: **trang không tự khai nó là của ai.** p06 Khang: "trang không có logo studio, không badge, không gì bảo chứng, chữ tối giản đến mức trống trải" · p05 Cô Liên: "không thấy tên công ty hay gì đảm bảo" · p07 Ông Tám: "không biết trang này của ai" · p04 Nam: "không có gì chứng minh đây là chỗ đáng tin" · p03 Hạnh: "trang không có gì tạo cảm giác 'chuyên nghiệp, đáng tin' rõ ràng" |

**Ba từ trước khi dùng:**
p01 "đơn giản · trống trải · tò mò" · p02 "quen thuộc · đơn giản · hơi tò mò" · p03 "trống · không chắc · phải tự mò" · p04 "trống trải · không rõ đây là gì · đơn giản quá mức" · p05 "tò mò · hơi rối · không chắc" · p06 "trống · sơ khai · chưa rõ ý đồ" · p07 "bỡ ngỡ · tò mò · không chắc chắn".

Từ lặp: **"không chắc / chưa rõ / không rõ" 5/7** · **"trống / trống trải" 4/7** · "tò mò" 4/7 · "đơn giản" 3/7.

**Ba từ sau khi dùng:**
p01 "dễ chơi · hơi tiếc rẻ (vì sao thấp) · muốn chơi thêm" · p02 "an tâm · rõ ràng · dễ chịu" · p03 "hụt hẫng · mất phương hướng · không dám tin" · p04 "nhẹ nhõm · bất ngờ theo hướng tốt · vẫn hơi mù mờ" · p05 "bối rối · tò mò · chưa an tâm" · p06 "nông · im lặng · chưa đủ" · p07 "lúng túng · tiếc · buông xuôi".

**Đổi theo hướng:** 3 lên (p01, p02, p04) · 1 giữ nguyên chiều âm và tự xác nhận (p06, negative persona — theo `persona-rules.md` §1 thì đây không phải thất bại) · **3 xuống (p03, p05, p07)**.

Đường chia rất sạch và nó là phát hiện lớn nhất của bảng này: **ba người đi đúng vòng lặp lõi — chơi, thắng, thua, tải lại — đều đi lên. Ba người phải hiểu một cơ chế hoặc dùng một cách nhập khác chuột đều đi xuống.** Sản phẩm thắng được lòng tin bằng hành vi (p04: "tiến độ KHÔNG mất… Trái với những gì tôi mặc định lúc đầu"), rồi mất lại bằng sự im lặng.

Ý định quay lại: p01, p02, p04 "có" · p05 "có, nhưng sẽ chơi dè dặt hơn" · p06 "có thể ghé lại một lần nữa *nếu* nghe ai đó nói game đã có thêm màn" · p03 "tôi sẽ không quay lại chơi tiếp bằng bàn phím" · p07 "chắc không tự quay lại một mình đâu, phải đợi cháu chỉ cho".

## Bảng điểm theo Red Route

| Red Route | Hiệu quả | Hiệu suất | Hài lòng |
| --- | --- | --- | --- |
| RR-01 · Qua màn 1 và mở được màn 2 | 1/1 phiên được giao · (2/4 nếu tính cả ba phiên khác cũng vào Màn 1 từ hồ sơ trắng: p04 đạt, p06 và p07 không) | 9 / 5 = **1,8×** | Tích cực có điều kiện — p01: "dễ chơi… muốn chơi thêm", kèm "hơi tiếc rẻ (vì sao thấp)" |
| RR-02 · Thua một màn rồi chơi lại mà không mất gì | 1/1 | 28 / 2 = **14×** — xem cảnh báo ở §Ghi chú, `min_steps: 2` không tính các lượt phải chơi để tiêu hết lượt | Tích cực nhất trong cả lượt chạy — p02: "an tâm — rõ ràng — dễ chịu" |
| RR-03 · Đóng tab rồi mở lại, tiến độ còn nguyên | 1/1 | 1 / 1 = **1,0×** | Tích cực, có dư âm — p04: "nhẹ nhõm, bất ngờ theo hướng tốt", nhưng vẫn "vẫn hơi mù mờ" |
| RR-04 · Tự hiểu quân đặc biệt sinh ra ở đâu | **0/1** phiên được giao · **0/3** nếu tính mọi persona từng gặp viên sọc (p01, p04, p05) | không đo được — dừng sau 5 thao tác (min 2) | Âm — p05: "bối rối… chưa an tâm"; "tôi không tự tin nói được viên vạch sọc dùng để làm gì nữa" |
| RR-05 · Chơi một màn chỉ bằng bàn phím | **0/1** — chỉ làm được 1/2 lượt đổi chỗ | 8 phím / 8 nhưng chỉ hoàn thành một nửa `done_when` | Âm nhất — p03: "hụt hẫng, mất phương hướng, không dám tin" |

## Phát hiện

Xếp theo mức nghiêm trọng giảm dần.

### F-01 · Critical · Interaction Design + Visual hierarchy + Visual craft + Trigger words

**Ở đâu:** RR-04 — viên đặc biệt (sọc) trong màn chơi, Màn 1 / Màn 2 / Màn 4.

**Chuyện gì xảy ra:** Ba persona độc lập nhau đều gặp viên sọc, ba người đều cố dùng nó, và **không ai làm nó nổ được**. Ba người dùng ba cách khác nhau — kéo, kéo hướng khác, tap-tap, chạm rồi kéo — và nhận ba kiểu kết quả không nhất quán: với p01 và p04 thao tác bị từ chối hoàn toàn (bàn không đổi, lượt không giảm); với p05 thao tác đi qua (lượt 18→17, điểm +180) nhưng viên sọc **không biến mất**, chỉ dời sang ô bên cạnh và vẫn nguyên hình sọc. Cộng thêm nửa còn lại của `done_when`: viên sọc không xuất hiện ở ô người chơi vừa chạm, nên không ai suy ra được luật sinh ra nó.

Nhìn ảnh thì rõ vì sao: viên sọc chỉ khác viên thường ở **một ký tự trắng nhỏ nằm trong ô** — hai gạch ngang "=" (`p01-07`) hoặc hai gạch dọc "||" (`p05-03`) thay cho hình tròn/sao/tam giác bình thường. Cùng kích thước, cùng màu nền, không viền, không hào quang, không phóng to, không nhấp nháy. Trong một bàn 7×7 hoặc 8×8 dày đặc, nó là thứ dễ bỏ sót nhất trên màn hình chứ không phải thứ dễ thấy nhất.

**Dẫn chứng:**
- p05 Cô Liên, bước kéo viên sọc — "viên vạch sọc đó KHÔNG biến mất, nó chỉ dời sang ô bên cạnh và vẫn còn y nguyên hình vạch sọc trên bàn. Tôi không thấy cả một hàng hay một cột nổ tung ra như tôi tưởng. *Điểm tăng đó, nhưng tăng vì cái gì tôi cũng không biết nữa*". Ảnh `p05-03-vien-vach-soc-xuat-hien.png` → `p05-04-sau-khi-dung-vien-soc.png`: viên "||" đi từ cột 1 sang cột 2 của hàng đáy và vẫn nằm đó.
- p05 Cô Liên, bước viên sọc xuất hiện — "nó không hiện đúng ngay chỗ tôi vừa kéo… nó hiện ra tuốt ở hàng dưới cùng, cột đầu tiên… *Ơ, sao viên lạ lại chạy xuống tuốt dưới đáy vậy? Tôi cứ tưởng nó phải nằm đúng chỗ tôi vừa đổi chứ.*"
- p04 Nam, giữa Màn 2 — "Tôi thử kéo nó qua ô bên cạnh để 'kích nổ' — không có gì xảy ra… Tôi thử kéo qua hướng khác — vẫn vậy. Tôi thử bấm chọn nó rồi bấm ô kế bên (kiểu tap-tap) — cũng không ăn thua. *Ủa sao viên này kéo hoài không chịu nổ vậy ta, hay tại mình bấm sai chỗ?*" Đây là 4 trong tổng số 4 thao tác vô hiệu của cả phiên anh.
- p01 Thuỷ, lần kéo thứ 6 — "kéo xong chẳng có gì xảy ra, điểm và lượt đứng yên y nguyên. Hơi tiếc vì tưởng sẽ có hiệu ứng đẹp." Ảnh `p01-07-sau-keo-lan-5.png` và `p01-08-sau-keo-lan-6-dac-biet.png` **giống hệt nhau từng điểm ảnh**: Lượt 11, Điểm 1.560 ở cả hai, viên "=" vẫn ở hàng 5 cột 4.

**Bao nhiêu người vấp:** 3/7 persona — và **3/3 trong số những người từng nhìn thấy một viên sọc**.

**Hướng xử lý:** `red-routes.md` §RR-04 nói đúng vấn đề: "không có màn hình hướng dẫn nào dạy điều này. Nó phải học được từ chính chuyển động trên bàn". Hiện tại toàn bộ gánh nặng dạy học đang nằm trên một ký tự trắng ~16px, và tương tác với nó cho ba kết quả khác nhau tuỳ tình huống. Hai việc phải quyết riêng: (a) viên sọc phải tự tách khỏi 48 ô còn lại ở tầng thị giác, không phải ở tầng ký tự; (b) mỗi lần người chơi chạm vào nó phải xảy ra **một** chuyện nhìn thấy được và luôn giống nhau — kể cả khi chuyện đó là "chưa được". Chừng nào còn im lặng thì màn 5 và 6 đúng như file Red Route dự đoán: bất khả.

### F-02 · Critical · Interaction Design + Visual craft + Visual hierarchy

**Ở đâu:** RR-05 — thứ tự Tab và chỉ báo ô đang chọn trong màn chơi.

**Chuyện gì xảy ra:** README hứa "fully keyboard playable". Người duy nhất thật sự không dùng được chuột làm được **1** lượt đổi chỗ rồi bỏ, vì sau lượt đó cô không còn biết con trỏ đang ở đâu. Bộ ảnh p03 cho thấy cơ chế chính xác, thứ mà lời kể một mình không nói ra được:

- `p03-05-focus-cell-1-1.png` — ô (1,1) có một vòng **hồng mảnh**: đây là trạng thái *focus*.
- `p03-06-after-enter-select1.png` — sau Enter, vòng đó chuyển thành **tối/đen** trên nền trang gần đen. Tức là trạng thái *đã chọn* **kém nhìn thấy hơn** chính trạng thái focus mà nó vừa thay thế.
- `p03-07-focus-cell-1-2-with-1-1-selected.png` — ảnh quyết định. Tên ảnh nói focus đã sang ô (1,2), nhưng trong ảnh **không có gì đánh dấu ô (1,2) cả**; vòng duy nhất còn trên màn hình vẫn là vòng tối ở ô (1,1). Khi đang có một ô được chọn, chỉ báo focus đang di chuyển biến mất.
- `p03-09` — vòng xuất hiện lại, nhưng ở nút "Chơi lại" trong cột trái, cách bàn cờ ~400px theo chiều ngang. `p03-10` — không còn vòng ở bất kỳ đâu trên trang. `p03-11` — vòng quay về "Về bản đồ".

Vòng tuần hoàn Tab vì vậy là: "Về bản đồ" → 49 ô → "Chơi lại" → *không thấy gì* → "Về bản đồ". Cùng một chỉ báo yếu đó cũng làm hỏng lượt chạm đầu tiên của người dùng cảm ứng trình độ số thấp.

**Dẫn chứng:**
- p03 Hạnh, bước chọn ô đầu tiên — "trạng thái ô báo 'được chọn' trong dữ liệu trang, nhưng nhìn màn hình tôi **không tự tin chỉ ra được ô nào sáng lên khác với 48 ô còn lại** — tất cả vẫn là những vòng tròn màu giống hệt nhau về hình dạng."
- p03 Hạnh, bước sau lượt đổi chỗ thành công — "con trỏ nhảy tọt xuống nút 'Chơi lại' ở tít cuối trang, cách xa cả bàn cờ 49 ô. *ủa, mình đang ở đâu vậy? Sao lại nhảy xuống đây, viên tôi vừa chọn đâu rồi?*" — rồi "con trỏ **biến mất khỏi trang hoàn toàn**". Ảnh `p03-09-focus-jumped-to-choi-lai.png`, `p03-10-tab-after-choi-lai.png`.
- p03 Hạnh, bước Tab đầu tiên trong màn — "con trỏ vào 'Về bản đồ' trước (không tới bàn cờ ngay) — *ơ, sao lại nhảy vào cái nút quay lại, không phải vào bàn?*" Ảnh `p03-04-after-tab-in-level.png`.
- p07 Ông Tám, bước chạm viên đỏ đầu tiên (cảm ứng, cùng chỉ báo đó) — "không thấy gì đổi khác trên hình, **chỉ có viên đó hơi khác chút (ông không chắc là có khác hay không)**". Ảnh `p07-03-cham-vien-do.png`: ô được chạm có một vòng sáng mảnh và không có gì khác.
- Kết cục, p03 — "Tôi sẽ không quay lại chơi tiếp bằng bàn phím… mà cổ tay tôi thì không cho phép cầm chuột để 'chữa cháy'."

**Bao nhiêu người vấp:** Chặn `done_when` của RR-05 với 1/1 persona được giao (mức sàn High); nguyên nhân gốc — chỉ báo chọn/focus — làm vấp thêm **1 persona nữa trên một cách nhập hoàn toàn khác** (p07, cảm ứng), nên nâng một bậc theo luật. Tổng 2/7.

**Hướng xử lý:** Trên lưới 49–64 ô, Tab-từng-ô có phải trục đi đúng hay không là quyết định của người làm sản phẩm. Thứ không thương lượng được là: luôn phải có **đúng một** dấu nhìn thấy được trên màn hình, và dấu "đang chọn" phải mạnh hơn dấu "đang focus" về mặt thị giác chứ không phải ngược lại. Thêm một việc riêng: nút phá huỷ ("Chơi lại", chơi lại từ đầu) đang nằm ngay sau ô cuối cùng của bàn cờ trong vòng Tab, tức người chơi bàn phím đi qua nó mỗi vòng.

### F-03 · High · Interaction Design + Trigger words

**Ở đâu:** Mọi màn chơi — nước đi không tạo được match.

**Chuyện gì xảy ra:** Khi một nước đi bị từ chối, màn hình **không đổi một điểm ảnh nào**. Không rung, không hoàn tác nhìn thấy được, không dấu X, không chữ. Bốn persona gặp, và phản ứng của họ tách đôi đúng theo trình độ số: người quen game đọc sự im lặng đó là "hệ thống kiểm tra nước đi đúng rồi", người không quen đọc nó là "mình đang làm sai" — và bỏ cuộc.

**Dẫn chứng:**
- p07 Ông Tám (nặng nhất) — "khoảng **7 lần trong tổng số 13 lần chạm**" không thấy gì đổi. "vẫn im re, không có gì phản hồi, **không có dấu X, không có rung lắc, không có chữ báo 'sai rồi' gì cả**". Rồi: "*chắc ông bấm không đúng cách, thôi thôi để lát nữa hỏi cháu chỉ cho*" → **BỎ CUỘC**, không hoàn thành màn nào. Trước đó ông còn "đứng yên chờ một chút xem màn hình có tự chỉ gì không — chờ hoài vẫn vậy". Ảnh `p07-09-be-tac-cham-lung-tung.png`.
- p01 Thuỷ, lần kéo đầu tiên — "bàn im re, lượt vẫn 15, điểm vẫn 0. *Ủa kéo không ăn à, hay mình kéo sai chỗ?* **Không có rung hay báo gì để biết là kéo bị từ chối**, hơi bối rối một chút." Ảnh `p01-02-man-choi.png` và `p01-03-sau-keo-lan-1.png` giống hệt nhau từng điểm ảnh.
- p02 Vy — "Có một, hai lần kéo mà bàn không đổi gì cả… *Chắc mình kéo sai chỗ, không ăn được thì thôi.*"
- p06 Khang (power user, đọc ngược lại) — "game **từ chối, hoàn tác về nguyên trạng, không trừ lượt**. Đúng như tôi đoán, xác nhận game có validate nước đi."

**Bao nhiêu người vấp:** 4/7 persona. Mức sàn Medium (chỉ tốn thêm bước với p01/p02/p06), nâng một bậc vì ≥2 người cùng vấp → **High**; nó nằm đầu dải High vì với p07 nó không tốn thêm bước mà kết thúc luôn phiên.

**Hướng xử lý:** Cùng một sự im lặng đang phục vụ hai thông điệp trái ngược nhau — "nước này không hợp lệ" và "không có chuyện gì xảy ra cả". Người chơi mới không có cách nào phân biệt. Đây cũng là chỗ rẻ nhất để sửa trong cả báo cáo: một phản hồi ngắn khi từ chối sẽ gỡ hơn phân nửa số thao tác vô hiệu của cả lượt chạy.

### F-04 · Medium · Trigger words + Visual hierarchy + Trust & desirability

**Ở đâu:** Hộp thoại "Thắng màn!" và thẻ màn trên bản đồ.

**Chuyện gì xảy ra:** Lượt chạy này ghi nhận **4 lần thắng, cả 4 đều được đúng 1/3 sao**: p01 2.640/2.000 (132% mục tiêu), p04 2.040/2.000 và 4.440/4.000, p02 6.600/6.000. Không chỗ nào trên màn hình — hộp thoại thắng, HUD trong màn, hay thẻ trên bản đồ — nói cần bao nhiêu điểm để có sao thứ hai. Kết quả là thắng lại cho cảm giác trượt.

**Dẫn chứng:**
- p01 Thuỷ, bước thắng màn — "chỉ được 1/3 sao dù điểm gần gấp rưỡi mục tiêu, mình hơi ngạc nhiên: *Ơ điểm cao vậy sao chỉ được 1 sao?*" và một trong ba từ đúc kết của cô là "**hơi tiếc rẻ (vì sao thấp)**". Ảnh `p01-10-thang-man-1-sao.png`: một sao vàng, hai sao rỗng, "Điểm 2.640", không có ngưỡng nào.
- p04 Nam, bước thắng Màn 1 — "*Ơ chỉ 1 sao thôi à, chắc phải chơi khéo hơn mới đủ sao*, nhưng thắng là được." Ảnh `p04-04-map-after-reload.png`: "Màn 1 ★☆☆ Điểm cao nhất: 2.040", "Màn 2 ★☆☆ Điểm cao nhất: 4.440" — vẫn không ngưỡng.

**Bao nhiêu người vấp:** 2/7 nói ra thành lời; 4/4 lần thắng trong cả lượt chạy đều rơi vào tình huống này. Mức sàn Low (khó chịu, không cản trở), nâng một bậc vì 2 người → **Medium**.

**Hướng xử lý:** `persona-rules.md` §8.2.3 đặt điều kiện cho ngày thứ hai là "một thành tựu nhìn thấy được sớm". Lượt chạy này sản xuất ra điều ngược lại: bốn lần thắng, bốn lần cảm giác chưa đủ. Ba ngôi sao chỉ có tác dụng kéo người chơi quay lại nếu người chơi biết mình còn thiếu bao nhiêu.

### F-05 · Medium · Trust & desirability + Visual craft + Visual hierarchy

**Ở đâu:** Màn hình đầu — mọi persona, mọi viewport.

**Chuyện gì xảy ra:** Bảy ảnh mở trang (`p01-01`, `p02-01`, `p03-01`, `p04-01`, `p05-01`, `p06-01`, `p07-01`) chứa đúng một tiêu đề — "Bản đồ màn" — sáu thẻ màn, và không gì khác. Không tên sản phẩm trên trang, không logo, không con vịt, không một dòng nói đây là cái gì, không chân trang. Ở 1440×900 (`p03-01`, `p04-01`, `p06-01`) nội dung dừng ở y≈290 và **khoảng 68% khung nhìn còn lại là nền phẳng**.

Điều đáng nói là bài test này cho ra kết quả tách đôi rất rõ: thông điệp "đây là game giải đố chia màn" **tới** (6/7 đoán đúng chỉ nhờ lưới thẻ "Màn N"), còn thông điệp "đây là Duck Match, do ai đó làm, và đây là lý do nó đáng thời gian của bạn" **không tồn tại trên màn hình**. Hai persona nhắc tới tên "Duck Match" đều lấy nó từ tiêu đề tab chứ không từ trang.

**Dẫn chứng:**
- p01 Thuỷ, ấn tượng 5 giây — "giao diện hơi trống, **không có hình con vịt hay màu mè gì nổi bật như tên game 'Duck Match' làm mình tưởng**, nên cũng hơi ngờ ngợ không biết đây có phải bản đầy đủ hay chỉ là bản thử nghiệm."
- p04 Nam — "không thấy tên game to, không thấy hình ảnh gì bắt mắt, **trông như một cái danh sách trần trụi hơn là một trò chơi**."
- p06 Khang — "chữ tối giản đến mức trống trải."
- p07 Ông Tám — "Nhìn kiểu chữ với mấy cái 'Chưa mở' thế này, chắc là dành cho tụi trẻ con hay thanh niên chơi game, **chứ không phải cho người già như ông**."
- Bảng ấn tượng đầu ở trên: **0/7 dám nhập email**, và 4/7 dùng chữ "trống/trống trải" làm một trong ba từ đầu tiên.
- Bổ trợ từ log (không phải lời persona): cả **7/7 phiên** đều ghi `[ERROR] Failed to load resource: 404 … /favicon.ico` — tab trình duyệt cũng không có biểu tượng.

**Bao nhiêu người vấp:** 5/7 nêu thành lý do không tin; 4/7 dùng từ "trống". Mức sàn Low, nâng một bậc → **Medium**.

**Hướng xử lý:** Game này không bao giờ hỏi email nên rủi ro thực tế bằng 0 — nhưng thước "dám nhập email" ở đây đo cái khác: nó đo việc người lạ có tin trang này là một thứ hoàn chỉnh hay không. 0/7 là câu trả lời. Khoảng trống 68% màn hình desktop là chỗ để trả lời câu "đây là cái gì" mà hiện tại không ai trả lời.

### F-06 · Medium · Visual craft + LATCH + Trigger words

**Ở đâu:** RR-04 — màn chơi ở zoom 200% (viewport 720×450), Màn 4.

**Chuyện gì xảy ra:** Hai chuyện chồng lên nhau với người thị lực kém.

Thứ nhất: `p05-02-vao-ban-choi.png` cho thấy thanh "Về bản đồ / Màn 4" + thẻ "Lượt/Điểm" + thẻ "Mục tiêu" ăn hết 230px trên cùng của 450px, chỉ còn **3,5 trong 8 hàng** của bàn cờ nhìn thấy được. Sang `p05-03` và `p05-04` — hai ảnh chụp đúng lúc cô đang quan sát viên sọc — thì Lượt, Điểm và Mục tiêu **đã trôi hoàn toàn khỏi màn hình**. Nghĩa là ở zoom 200%, nguyên nhân (nước đi của tôi) và kết quả (điểm/lượt thay đổi) không bao giờ cùng nằm trong tầm nhìn.

Thứ hai: mục tiêu nhiều điều kiện của Màn 4 hiện là một hàng "🟦 0/12 · 🔶 0/12 · 0/4.000" — hai điều kiện chỉ có icon không có chữ, điều kiện thứ ba không có cả icon lẫn chữ.

**Dẫn chứng:**
- p05 Cô Liên, bước vừa vào bàn — "*Ôi bàn to quá, mắt tôi không lướt hết được, chắc phải nhìn từng góc một.*" Ảnh `p05-02-vao-ban-choi.png`.
- p05 Cô Liên, bước đọc mục tiêu — "'Mục tiêu' liệt kê vài thứ (0/12, 0/12, 0/4.000)" — cô liệt kê được các con số nhưng không nói được chúng là mục tiêu gì.
- p05 Cô Liên, bước sau khi dùng viên sọc — "*Điểm tăng đó, nhưng tăng vì cái gì tôi cũng không biết nữa*" — ảnh `p05-04` xác nhận: lúc đó HUD nằm ngoài màn hình.
- p05 Cô Liên, bước nước đi đầu tiên — "tôi thấy nó đổi chỗ xong vài viên tự nhiên biến mất, nhưng **nổ ở đâu, tại sao đúng ba viên đó thì tôi không kịp nhìn**."

**Bao nhiêu người vấp:** 1/7 — nhưng là 1/1 người trong dàn có nhu cầu tiếp cận về thị lực. Không nâng bậc. **Medium**.

**Hướng xử lý:** Hai thẻ HUD xếp chồng theo chiều dọc là thứ đắt nhất trên một khung nhìn thấp. Câu hỏi phải quyết: ở độ phóng lớn, cái gì buộc phải luôn nhìn thấy cùng bàn cờ — và ba con số mục tiêu không nhãn đó có đọc được bằng chữ thay vì bằng icon không.

### F-07 · Medium · Interaction Design — *cần dựng lại để xác nhận*

**Ở đâu:** RR-05 — lượt đổi chỗ bằng bàn phím, Màn 1.

**Chuyện gì xảy ra:** So hai ảnh liên tiếp `p03-07-focus-cell-1-2-with-1-1-selected.png` và `p03-08-after-swap1-attempt.png`: sau cú Enter thứ hai của Hạnh, **toàn bộ bàn 7×7 đổi khác**, không chỉ hai ô cô định đổi (hàng 3 đi từ ★▲●●▲■▲ sang ◆◆▲●◆■■; hàng 7 đi từ ★●▲▲◆■■ sang ●●◆◆●◆◆). Trong khi đó HUD ở cả hai ảnh đọc y hệt: "Lượt 15 · Điểm 0 · Mục tiêu 0/2.000". Bàn cờ ở `p03-04` → `p03-07` là một bàn, ở `p03-08` → `p03-11` là một bàn khác hẳn; thời điểm chuyển trùng đúng với cú Enter thứ hai.

Hạnh đọc chuyện này là lượt đổi chỗ của mình đã thành công. HUD nói không có gì xảy ra. Cô không có cách nào nhận ra sự vênh đó vì mắt cô đang dán vào hai ô.

**Dẫn chứng:** p03 Hạnh, bước Enter lần 2 — "**hai viên đổi màu cho nhau thật** (đỏ và vàng tráo chỗ) — vậy là đổi chỗ được bằng bàn phím, không chạm chuột, thành công 1 lần! Tôi mừng thầm." Ảnh `p03-07` (bàn A, Lượt 15, Điểm 0) → `p03-08` (bàn B hoàn toàn khác, Lượt 15, Điểm 0).

**Bao nhiêu người vấp:** 1/7 — và cô không biết mình đang vấp. **Medium**, kèm nhãn rõ: đây là hai ảnh và một câu nói, không phải một phép đo lặp lại được. Cần một phiên dựng lại riêng để xác nhận đường bàn phím có cho ra cùng kết quả với đường chuột hay không. `ux-expert` không xem mã nguồn nên không suy đoán gì thêm.

**Hướng xử lý:** Đo lại trước, kết luận sau. Nếu xác nhận được thì nó đứng trên F-02 chứ không dưới.

### F-08 · Medium · Interaction Design + Trust & desirability

**Ở đâu:** Rời màn chơi giữa chừng — bản đồ màn.

**Chuyện gì xảy ra:** Bỏ dở một màn thì toàn bộ điểm trong màn đó biến mất, và bản đồ hiện lại "Chưa có tiến độ" như chưa từng chơi. Không có cảnh báo trước khi rời, không có dòng nào nói điểm giữa màn không được lưu. Hai persona quan sát thấy; với người có trình độ số thấp thì thứ mất đi chính là **bằng chứng duy nhất rằng mình từng làm đúng một lần**.

**Dẫn chứng:**
- p07 Ông Tám, bước cuối — "Về tới nơi thì thấy Màn 1 vẫn ghi y như lúc đầu: 'Đạt 0/3 sao — Chưa có tiến độ' — y như là ông chưa hề chơi gì cả, dù lúc nãy ông đã ăn được 180 điểm. *ủa vậy hồi nãy chơi có tính không hay mất tiêu rồi*". Ảnh `p07-09-be-tac-cham-lung-tung.png` (Điểm 180, Lượt 14) → `p07-11-quay-ve-ban-do-bo-cuoc.png` ("Màn 1 ☆☆☆ Chưa có tiến độ").
- p06 Khang — "tiến độ màn 1 mất luôn (map vẫn ghi 'Chưa có tiến độ', 'Đạt 0/3 sao'), tức là **chơi dở không lưu**." Anh ghi nhận trung tính, không bị cản.

**Bao nhiêu người vấp:** 2/7 quan sát, 1/7 thật sự bị ảnh hưởng. **Medium**.

**Hướng xử lý:** Việc không lưu điểm giữa màn là bình thường ở thể loại này và không cần đổi. Cái cần đổi là nó đang xảy ra không một lời nào — và nó rơi trúng vào đúng người ít có khả năng tự suy ra nhất. Đặt cạnh F-03: người chơi ấy vừa mất phản hồi lúc thao tác, vừa mất kết quả lúc rời đi.

### F-09 · Low · Trigger words + Interaction Design

**Ở đâu:** Bản đồ màn — thẻ màn đang khoá.

**Chuyện gì xảy ra:** Bấm vào một màn đang khoá cho ra **không gì cả**: không toast, không tooltip, không rung, không đổi con trỏ. Chữ "Chưa mở" nói trạng thái nhưng không nói điều kiện — người chơi không biết phải làm gì để mở, cũng không biết đây là "chưa đủ điều kiện" hay "chưa được làm".

**Dẫn chứng:** p06 Khang, bước cuối — "Bấm thử vào chữ 'Màn 2' (dòng bị khoá) — **không có gì xảy ra**: không toast, không tooltip, không rung lắc báo 'khoá', trang đứng yên hệt như trước khi bấm." Và: "chữ đó chỉ nói 'bị khoá', **không nói 'chưa được làm' hay 'sẽ sớm có'**. Bấm thẳng vào nó cũng không cho phản hồi gì thêm (không tooltip giải thích điều kiện mở khoá)." Ảnh `p06-01-first-look.png` và `p06-04-click-locked-level.png` giống hệt nhau.

**Bao nhiêu người vấp:** 1/7 bấm thật. p07 suy đúng và không bấm ("mấy cái kia chưa mở thì bấm cũng vô ích"). **Low**.

**Hướng xử lý:** Ghi chú kèm theo từ p06, đáng đọc riêng vì nó là câu trả lời cho câu hỏi bắt buộc của phiên negative persona: "game **không hề tự nói** nó đang ở giai đoạn nào… không có badge 'bản thử nghiệm'/'beta', không có dòng chữ 'sắp ra mắt thêm màn'… **Tôi phải tự đâm vào bức tường** rồi mới tự suy ra kết luận." Với một sản phẩm mới có 6 màn, việc trang không nói gì về chuyện đó là một lựa chọn — chỉ cần biết là nó đang được chọn.

### F-10 · Low · Visual hierarchy + Visual craft + Trigger words

**Ở đâu:** RR-02 — hộp thoại "Hết lượt!" so với "Thắng màn!".

**Chuyện gì xảy ra:** Hai hộp thoại không cân nhau, và sự lệch đó rơi đúng vào nỗi sợ mà `persona-rules.md` §8.4(b) đã dự đoán ("tưởng thua là bị khoá lại màn trước"). So `p02-03-accidental-win.png` với `p02-04-het-luot-dialog.png`:

- Hộp thắng: tiêu đề · hàng 3 sao · dòng "Điểm 6.600" · nút chính **xanh lá** "Màn tiếp" · nút phụ tím mờ "Chơi lại" · link chữ "Về bản đồ".
- Hộp thua: tiêu đề · mỗi dòng "Mục tiêu 5.040/6.000" · "Chơi lại" **mang đúng kiểu dáng nút phụ tím mờ** của hộp thắng · link chữ "Về bản đồ". Không hàng sao, không dòng "Điểm", và **không có nút nào mang trọng lượng nút chính**.

Thêm một chi tiết nhỏ: ở cả `p01-10`, `p02-03` và `p02-04`, nút "Chơi lại" toàn chiều rộng của trang vẫn hiện phía sau lớp phủ, nên chữ "Chơi lại" xuất hiện hai lần cùng lúc trên màn hình.

**Dẫn chứng:** p02 Vy, bước đọc hộp thua — "dialog thua này **KHÔNG hiển thị số sao hay dòng 'Điểm' riêng như lúc thắng** — chỉ có mỗi dòng tiến độ mục tiêu. *Ừ thì thua rồi, nhưng không thấy nó nói gì về việc mất sao hay mất điểm cả, vậy chắc không sao.*" Và cô đã phải tự đi kiểm tra: "Tôi **KHÔNG** bấm 'Chơi lại' ngay. Tôi bấm 'Về bản đồ' trước để kiểm tra xem có bị mất gì không." Kết luận của cô: "Điều duy nhất hơi tiếc là dialog 'Hết lượt!' **không nói thẳng một câu kiểu 'Điểm/sao của bạn được giữ nguyên'** — phải tự mình quay về bản đồ để kiểm tra mới biết chắc."

**Bao nhiêu người vấp:** 1/7 (chỉ p02 nhìn thấy hộp thua trong cả lượt chạy). **Low**.

**Hướng xử lý:** Hành vi đã đúng — không mất gì cả, và p02 đã tự xác minh từng dòng. Cái thiếu là sản phẩm chưa bao giờ nói ra điều đó, nên mỗi người chơi phải tự kiểm tra một lần. Một câu ở đúng khoảnh khắc thua sẽ biến RR-02 từ "đạt sau khi người chơi tự audit" thành "đạt ngay tại chỗ".

## Không phát hiện được gì ở

- **RR-03 · Đóng tab rồi mở lại, tiến độ còn nguyên — sạch hoàn toàn.** p04 Nam ghi nhớ từng con số trước khi tải lại, rồi so lại từng dòng: "Màn 1 vẫn 1/3 sao — 2.040. Màn 2 vẫn 1/3 sao — 4.440. Màn 3 vẫn 0/3 sao — chưa có tiến độ nhưng vẫn mở. Màn 4, 5, 6 vẫn khóa. **Không có màn hình trắng, không có lỗi gì**, y hệt như trước khi tải lại." Ảnh `p04-03-map-before-reload.png` và `p04-04-map-after-reload.png` khớp nhau. 1 hành động, 0 lần quay lui, đúng `min_steps`. Đây cũng là thứ duy nhất trong cả lượt chạy **đảo ngược được một định kiến**: "*Thôi chắc về 0 hết cho coi, có tài khoản gì đâu mà lưu*" → "tiến độ KHÔNG mất… trang này tự lưu lại được, không cần tài khoản."
- **Hành vi của RR-02 — sạch; chỉ phần nói ra là thiếu (F-10).** p02 kiểm tra từng màn sau khi thua: không màn nào bị khoá lại, không sao nào bị tụt, và điểm thấp hơn của lần thua **không** ghi đè lên điểm cao nhất cũ (Màn 5 giữ 6.600 dù lần sau chỉ được 5.040). Thêm một điều bất ngờ theo hướng tốt: "Màn 6 giờ đã MỞ KHOÁ… **mình thắng một lần là mở khoá được màn sau luôn, có thua lại sau đó cũng không bị đóng lại. Yên tâm thật.**"
- **Không phiên nào gặp màn hình trắng, sập, popup cookie, quảng cáo, ép đăng ký, hay âm thanh tự phát.** Đúng như `persona-rules.md` §8.1 mô tả và §8.2.4 yêu cầu kiểm. Log console của cả 7 phiên chỉ có một 404 `/favicon.ico` và bốn cảnh báo preload font; **không có lỗi JS nào**, kể cả trong phiên bàn phím (p03 ghi rõ: "không có lỗi JS liên quan tới thao tác đổi chỗ").
- **Không có phát hiện nào về độ khó, nhịp game hay cảm giác điều khiển** — theo `persona-rules.md` §8.3 đây là những thứ persona điều khiển qua công cụ không đo được. Việc p07 chỉ ăn được 1 nước trong 13 lần chạm đã được ghi như **điều kiện của phép đo cộng với F-03**, không ghi như một phát hiện về độ khó.

## Ghi chú về chính lần chạy này

1. **Chạy tuần tự, không song song.** MCP Playwright ở máy này chỉ phơi một browser dùng chung, nên 7 phiên chạy lần lượt thay vì 4 phiên đồng thời như `orchestration.md` cho phép. Giữa mỗi phiên, người vận hành xoá sạch localStorage + cookie và đặt lại viewport + throttle mạng. Điều này chỉ kéo dài thời gian, không cắt phạm vi.
2. **Subagent `ux-persona` không dùng được, đã thay bằng subagent phổ thông.** File `.claude/agents/ux-persona.md` khai `tools: mcp__playwright__*`, nhưng server MCP ở máy này tên `plugin_playwright_playwright` — glob khớp rỗng, và phiên thử đầu tiên rơi xuống `claude-in-chrome` (không kết nối) rồi chết. Đã sửa file agent, nhưng Claude Code nạp định nghĩa agent lúc mở phiên nên bản sửa chưa có hiệu lực. Cách chạy thay thế: subagent phổ thông, dán nguyên văn bộ chỉ dẫn của `ux-persona.md` vào brief, kèm lệnh cấm cứng Read/Bash/Grep/Glob/WebFetch để giữ tính "người lạ hoàn toàn". Không persona nào đọc mã nguồn. Lần chạy sau, sau khi khởi động lại phiên, nên dùng lại agent thật.
3. **Hai phiên được gieo sẵn tiến độ** để dựng đúng bối cảnh trong hồ sơ persona — persona không hề biết và không thao tác gì với chuyện đó:
   - p02 Vy: `unlockedUpTo: 5`, Màn 1 3★/4.120 · Màn 2 2★/3.380 · Màn 3 2★/5.240 · Màn 4 1★/6.010
   - p05 Cô Liên: `unlockedUpTo: 4`, Màn 1 2★/3.100 · Màn 2 2★/3.450 · Màn 3 1★/4.200

   p04 Nam thì **không** gieo — anh tự chơi thắng 2 màn rồi mới tải lại trang, vì thứ RR-03 cần đo là tiến độ do chính người chơi tạo ra có sống sót không.
4. **Phiên p05 phải chạy lại từ đầu.** Lần chạy đầu bị cắt giữa chừng do chạm giới hạn phiên API (lỗi hạ tầng, không liên quan sản phẩm). Ảnh dở đã xoá, trạng thái dựng lại sạch.
5. **Mô phỏng thiết bị:** viewport đặt qua Playwright, throttle mạng qua CDP `Network.emulateNetworkConditions`. Slow 4G = 1.6 Mbps down / 750 kbps up / 562.5 ms RTT, áp cho p01 và p07. Cô Liên (p05) zoom 200% được dựng bằng viewport 720×450 — đúng vùng nhìn thật của laptop 1440×900 ở zoom 200%.

Bốn ghi chú thêm từ phía phân tích, ảnh hưởng tới cách đọc bảng điểm:

6. **`min_steps: 2` của RR-02 đang tính thiếu.** Nó giả định người chơi đã cầm sẵn màn hình "Hết lượt!". Trên thực tế p02 phải chơi cạn 16 lượt của Màn 5 mới tới được đó, nên tỉ số 28/2 = 14× **không so sánh được** với các route khác và không phải dấu hiệu của ma sát. Đây là chuyện của `red-routes.md`, không phải của sản phẩm — nhưng sửa file đó thì mất khả năng so với lượt chạy này, nên để nguyên và ghi cảnh báo ở đây.
7. **Nút "Chơi lại" phía thua chưa từng được bấm trong cả lượt chạy.** p02 chọn "Về bản đồ" trước để tự kiểm tra tiến độ, rồi phiên kết thúc ở đó. Cú "Chơi lại" duy nhất được thực hiện là cú trong hộp **thắng**. RR-02 được chấm ĐẠT vì cả hai vế của `done_when` đều đã được chứng minh (bàn mới + lượt/điểm về đầu sau "Chơi lại"; bản đồ không khoá lại màn nào sau khi thua), nhưng **đường chuyển thua → chơi lại chưa được đo trực tiếp** và nên được giao rõ trong lượt chạy sau.
8. **Mức phủ của hai route hỏng không bằng nhau.** RR-04 hỏng có ba người chứng (p01, p04, p05 — trong đó p01 và p04 không được giao route này), nên đó là kết luận chắc. RR-05 hỏng chỉ có một người chứng (p03); phần "không phân biệt được ô đang chọn" có p07 chứng gián tiếp qua cảm ứng, nhưng phần "mất dấu con trỏ khi Tab" thì **chưa có người thứ hai**. Nếu muốn chắc trước khi đầu tư sửa, thêm một persona bàn phím nữa là đủ.
9. **`ux-expert` không liệt kê được thư mục `references/personas/`** — vai đó chỉ có tool `Read`, và `Read` không mở được thư mục. Bối cảnh persona trong báo cáo này vì vậy lấy từ khối tiêu đề của chính 7 file log (thiết bị, throttle, trạng thái gieo, ràng buộc diễn, `patience_threshold` thể hiện qua hành vi dừng), chứ không từ hồ sơ gốc. Lần chạy sau nên truyền thẳng đường dẫn từng file persona vào brief. Đã đọc và dùng đầy đủ: `lib/frameworks.md`, `lib/report.tpl`, `lib/orchestration.md`, `references/red-routes.md`, `references/persona-rules.md`, `SKILL.md`.
10. **Đã mở 34/46 ảnh**, gồm **toàn bộ 7 ảnh mở trang** và **toàn bộ ảnh ở mỗi điểm kẹt** (p01-03, p01-07, p01-08, p01-10 · p02-03, p02-04, p02-05 · p03-04 → p03-11 · p04-04 · p05-02, p05-03, p05-04 · p06-02, p06-04 · p07-02, p07-03, p07-09, p07-11). Hai lăng kính Visual craft và Trust & desirability được chấm từ các ảnh này. Project **không có** `.claude/uiux/`, nên không có token thiết kế nào để đối chiếu — mọi nhận xét thị giác ở trên đều phát biểu dưới dạng quan hệ đo được trong chính ảnh (tương phản giữa hai trạng thái, tỉ lệ khung nhìn bị bỏ trống, thành phần nào nhìn thấy cùng lúc với thành phần nào), không dựa vào gu thẩm mỹ.
