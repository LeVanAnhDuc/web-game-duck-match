# Rule tạo persona — Duck Match

> **Chưng ngày 2026-09-11.** Bản seed offline đã bị thay hoàn toàn.
> Fetch **4/6 nguồn trực tiếp**; `userfocus.co.uk` trả **403** và trang blog GDS cũ trả
> **404**, nên Red Routes và persona tiếp cận lấy từ nguồn thứ cấp — ghi rõ ở §Nguồn cuối file.
> Mục 1–7 là rule chung của nghề. **Mục 8 là phần riêng của domain này**, và nó là phần
> quyết định persona nghe như người chơi thật hay nghe như một cái brief.

## 1. Phân loại (Cooper, *About Face*)

Cooper chia sáu loại. Ở một game một-người-chơi, không đăng nhập, không có người trả tiền,
**ba loại mất nghĩa** — ghi ra để không ai đi bịa chúng:

| Loại | Nghĩa | Ở game này |
| --- | --- | --- |
| **primary** | người mà sản phẩm được thiết kế cho. Định nghĩa chặt của Cooper: người **không thể** được phục vụ bằng một giao diện thiết kế cho ai khác. Mỗi dàn có ít nhất một | **bắt buộc có** |
| **secondary** | phần lớn mục tiêu đã được đáp ứng khi phục vụ primary, còn thiếu vài thứ | **bắt buộc có** |
| supplemental | không nhắm tới, nhưng nhu cầu tự được đáp ứng | dùng được, không bắt buộc |
| customer | người **mua**, khác người dùng | **không áp dụng** — không ai trả tiền |
| served | bị ảnh hưởng bởi sản phẩm nhưng không dùng nó | **không áp dụng** — game chạy hoàn toàn trong máy người chơi, không ảnh hưởng ai khác |
| **negative** | người sản phẩm **không** nhắm tới. Có mặt để phát hiện đang phục vụ nhầm ai | **đúng một người**, không hơn |

Negative persona **không phải người ghét sản phẩm**. Là người mà nếu ta bắt đầu làm họ hài
lòng thì ta đang đi chệch — ví dụ người chơi thi đấu đòi luật quốc tế, hoặc người đòi tài
khoản và bảng xếp hạng toàn cầu. Phiên của họ có giá trị ở chỗ: nếu họ thấy **dễ chịu**, đó
là một cảnh báo, không phải một thắng lợi.

## 2. Persona bám hành vi, không bám nhân khẩu học

NN/g nói thẳng về persona dựng từ giả định của đội (proto-persona):

> *"as proto personas are not driven by research, they are often an inaccurate
> representation of your users and can be an echo chamber for the team's incorrect
> assumptions."*

và về persona dựng từ nhân khẩu học:

> *"we do not recommend that approach, as it leads to personas with limited utility for UX
> decision making."*

**Dàn persona trong file này đúng là proto-persona** — không có phỏng vấn người thật nào
đứng sau. Nên nó phải được đọc đúng như thế: nó **thu hẹp** danh sách câu hỏi cần hỏi năm
người thật, chứ **không thay** năm người đó.

Quy tắc viết: mỗi dòng trong persona phải **đổi được một hành vi quan sát được**.

- ✗ "Nữ, 28 tuổi, thích du lịch" — không dự đoán được hành vi nào
- ✓ "Bấm nút Back của trình duyệt thay vì nút quay lại trong trang" — dự đoán được
- ✓ "Không đọc chữ trên màn hình đầu, bấm ngay nút to nhất" — dự đoán được
- ✓ "Bỏ cuộc sau 3 lần bấm mà màn hình không đổi" — đây chính là `patience_threshold`

## 3. Trường bắt buộc của một persona

| Trường | Vì sao bắt buộc |
| --- | --- |
| `type` | primary · secondary · supplemental · negative (xem §1) |
| bối cảnh, nghề nghiệp | để hành vi persona nghe như thật, và để giải thích vì sao họ mở game **lúc này** |
| trình độ số | quyết định mức chịu đựng với thuật ngữ và với giao diện dày đặc |
| thiết bị + điều kiện mạng | đổi **thẳng** thành viewport và network throttle của phiên |
| nhu cầu tiếp cận | dàn **bắt buộc** có ít nhất một người chỉ dùng bàn phím hoặc thị lực kém |
| động cơ, nỗi sợ | định hướng cái persona chú ý tới trong 5 giây đầu |
| `patience_threshold` | 2–6 bước bế tắc liên tiếp thì bỏ cuộc — **điều kiện dừng thật** của phiên |
| ngôn ngữ | tiếng Việt hoặc tiếng Anh |
| `jtbd` | một câu, xem §4 |

## 4. Jobs-To-Be-Done — nguồn của `goal_in_user_words`

Dạng câu: ***Khi \_\_\_, tôi muốn \_\_\_, để \_\_\_.***

Điểm mấu chốt của JTBD so với user story là vế đầu: `Khi` (bối cảnh) thay cho `Là một`
(vai trò). Bối cảnh quan trọng hơn danh tính — hai người khác hẳn nhau, ở cùng một tình
huống, có cùng một job.

Từ câu JTBD sinh ra `goal_in_user_words` cho mỗi Red Route — diễn đạt bằng **từ của người
chơi**, cố ý tránh từ của sản phẩm:

- ✓ "đang đợi xe, muốn giết mười phút bằng cái gì đó không phải mạng xã hội"
- ✗ "dùng tính năng chơi nhanh" ← đây là từ của sản phẩm, và nó **mách nước**

Một `goal_in_user_words` nhắc tên một nút trên màn hình là đã hỏng: persona không còn mò
nữa, và ta mất đúng thứ đang muốn đo.

## 5. Red Routes (David Travis)

Red route = việc **nhiều người làm** × **làm thường xuyên**. Travis dựng nó trên một ma
trận hai trục: trục X là bao nhiêu người dùng chức năng đó, trục Y là dùng bao nhiêu lần.

Bản 2006 bổ sung một điều mà ma trận hai trục dễ làm quên: **chỉ tần suất là không đủ**,
phải cộng thêm mức nghiêm trọng của luồng. Một việc hiếm nhưng hỏng là mất sạch (mua nhầm,
xoá mất tiến độ) vẫn là red route.

Hệ quả bắt buộc: **đừng tô đỏ hết mọi thứ.** Một danh sách toàn đỏ thì không ưu tiên được
gì, và đó đúng là cái sai mà ma trận sinh ra để tránh.

## 6. Persona tiếp cận (GDS / GOV.UK)

GDS dựng bảy persona tiếp cận, mỗi người kèm một mô phỏng và công nghệ hỗ trợ thật:

| Tên | Tình trạng |
| --- | --- |
| Claudia | thị lực kém — dùng phóng đại màn hình |
| Ashleigh | khiếm thị nặng — dùng screen reader |
| Ron | người lớn tuổi, nhiều tình trạng cùng lúc |
| Chris | viêm khớp dạng thấp — thao tác chính xác là khó |
| Pawel | tự kỷ — nhạy cảm với chuyển động và quá tải thị giác |
| Simone | khó đọc (dyslexia) |
| Saleem | điếc sâu — không tiếp cận được nội dung âm thanh |

GDS tự ghi kèm một cảnh báo phải chép lại nguyên vẹn:

> *"This is not a substitute for including users with access needs into your user testing."*

Dàn persona ở đây **mượn hình dạng** của GDS, không mượn thẩm quyền của nó. Với một game
canvas, ba người đáng dùng nhất là **Chris** (chỉ bàn phím, thao tác chính xác khó),
**Claudia** (phóng đại, nhìn được một phần màn hình) và **Pawel** (chuyển động, hiệu ứng
nhấp nháy). **Ashleigh** ít dùng được: game vẽ trên canvas thì screen reader chỉ đọc được
phần vỏ HTML, và điều đó tự nó đã là một phát hiện chứ không cần một phiên riêng.

## 7. Kích thước dàn

5–7 người, **cố định giữa các lần chạy**. Đẻ persona mới mỗi lần chạy là tự tay phá thứ đắt
nhất mà skill này tạo ra: khả năng so sánh trước và sau khi sửa.

Bắt buộc trong dàn: ít nhất **một persona tiếp cận**, **đúng một negative persona**, và ít
nhất **một người dùng điện thoại trên mạng chậm**.

## 8. Domain — game casual chạy thẳng trong trình duyệt

Đây là phần **không lấy từ sách persona**, mà từ cách người ta thật sự mở một game web.

### 8.1 Bối cảnh chung của cả họ game này

Cả 11 game trong `web-game/` chia chung một hình dạng, và hình dạng đó quyết định persona:

- **Không đăng nhập, không tài khoản, không server.** Persona nào đòi "đăng ký" là đang
  bịa ra một màn hình không tồn tại. Nhưng persona **lo** rằng sắp phải đăng ký thì là
  thật — đó là một nỗi sợ đáng viết vào.
- **Tiến độ nằm trong `localStorage` của đúng trình duyệt đó.** Đổi máy là mất. Người chơi
  không biết điều đó, và sự không-biết đó là nguyên liệu tốt cho persona.
- **Mở từ một cái link ai đó gửi**, không phải từ cửa hàng ứng dụng. Nên **không màn hình
  onboarding nào được tha thứ**: người chơi đến với kỳ vọng chơi được trong 5 giây.
- **Trần chi phí 0đ**, nên không quảng cáo, không analytics. Persona không bao giờ gặp
  popup xin quyền, xin cookie, xin thông báo.

### 8.2 Bốn hành vi đo được, lấy từ thực tế người chơi game web

1. **Không ai đọc hướng dẫn trước.** Hướng dẫn là chỗ rơi người nhiều nhất; nếu có thì phải
   bỏ qua được. Persona mặc định **bấm nút to nhất trên màn hình đầu**, không đọc gì.
2. **Phiên rất ngắn và bị cắt ngang.** Người chơi mobile chơi lúc đợi, ở nơi ồn, một tay.
   Desktop chơi lâu hơn và chịu được giao diện dày hơn. Hai nhóm này **không** dùng chung
   một persona.
3. **Ngày đầu quyết định có ngày thứ hai không.** Cái phải chứng minh trong lượt chơi đầu
   là "cái này đáng thời gian của tôi" — không phải chiều sâu, mà là **một thành tựu nhìn
   thấy được sớm**.
4. **Âm thanh bật sẵn là rủi ro, không phải tính năng.** Mở game ở văn phòng mà nó kêu thì
   tab bị đóng ngay. Dàn persona phải có ít nhất một người kiểm điều này.

### 8.3 Trần của phương pháp — đọc trước khi viết `patience_threshold`

Persona điều khiển qua công cụ, mỗi thao tác mất hàng trăm ms tới vài giây. Với game thời
gian thực, **persona không chơi giỏi được** — nó không né được, không phản xạ được.

Hệ quả bắt buộc:

- **"Persona chết nhanh" không phải một phát hiện UX.** Đừng ghi nó vào báo cáo như một
  phát hiện; ghi nó như một điều kiện của phép đo.
- Cái đo được là **lớp vỏ**: màn hình đầu, menu, cài đặt, bảng điểm, màn kết thúc, và
  **hiểu hay không hiểu luật**. Cái không đo được là **độ khó, nhịp, cảm giác điều khiển**.
- `patience_threshold` vì vậy đếm **bước bế tắc do giao diện**, không đếm lần chết trong game.

### 8.4 Từ ngữ — persona nói tiếng người chơi, không nói tiếng sản phẩm

Người chơi match-3 gần như đều đến từ Candy Crush. Từ họ dùng: "đổi hai viên", "ăn được
một dây", "hết lượt rồi", "được mấy sao", "màn này khó quá".

Họ **không** dùng: "cascade", "deadlock", "colour bomb" — dù họ hiểu rõ hành vi đó khi thấy.

Hai kỳ vọng mang từ Candy Crush sang và **cả hai đều sai ở game này**, nên chúng là nguyên
liệu persona rất tốt: (a) tưởng hết lượt là mất mạng và phải chờ, (b) tưởng thua là bị khoá
lại màn trước. Game này không có cả hai, nhưng người chơi **không biết điều đó** cho tới khi
họ thua lần đầu.

---

## Nguồn

| Nguồn | Dùng cho | Trạng thái fetch |
| --- | --- | --- |
| NN/g — *Personas: Proto, Qualitative, Statistical* · <https://www.nngroup.com/articles/persona-types/> | §2 | ✅ fetch trực tiếp, đã trích nguyên văn |
| Cooper — *About Face*, sáu loại persona | §1 | ⚠️ nguồn thứ cấp; sách gốc không fetch được |
| Job Stories / JTBD — dạng *When … I want to … so I can …* | §4 | ✅ tổng hợp từ tìm kiếm, nhiều nguồn khớp nhau |
| David Travis — Red Routes | §5 | ⚠️ `userfocus.co.uk/articles/redroutes.html` trả **403**. Lấy từ nguồn thứ cấp: The Decision Lab, Rik Williams (ma trận + flowchart), usability-ed |
| GDS / GOV.UK — Accessibility Personas · <https://alphagov.github.io/accessibility-personas/> | §6 | ⚠️ trang chỉ mục fetch được (đủ 7 tên + cảnh báo nguyên văn); blog GDS 2018 trả **404**; chi tiết từng người nằm ở trang con chưa fetch |
| Nghiên cứu domain game web casual — retention ngày 1, bỏ qua hướng dẫn, phiên ngắn trên mobile | §8.1–8.2 | ✅ tổng hợp từ tìm kiếm |
| `docs/01-product/` + `README.md` §Features của chính project này | §8.4 | ✅ đọc trực tiếp |

**Không fetch lại file này trừ khi người dùng yêu cầu.** Lệnh là
`install.sh <project> --refresh-rules`, rồi làm lại Bước 4 của `ux-persona-lab`.
