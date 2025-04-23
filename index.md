---
layout: distill
title: "Khoa học máy tính cho mọi người"
subtitle: "cs4all-vn"
# permalink: /main/
description: "Khoa học máy tính không chỉ dừng ở thuật toán mà nó còn rất nhiều thứ khác rất thú vị như Programming Language (Ngôn ngữ lập trình), Compiler (Trình biên dịch), Computer Graphics (Đồ họa máy tính), AI, vâng vâng và mây mây. Trang này được xây dựng tương tự như VNOI Wiki với mong muốn trở thành một thư viện cho các bạn học sinh/sinh viên/người đi làm/... (con người nói chung) có thể tiếp cận từ đó tạo nên một tình yêu đối với Khoa học máy tính nói chung và tạo nên một cộng đồng về Khoa học máy tính ở Việt Nam nói chung."
date: 2025-02-04
future: true
htmlwidgets: true
hidden: false
giscus_comments: true

previous_section: false 
next_section: false

# Add a table of contents to your post.
#   - make sure that TOC names match the actual section names
#     for hyperlinks within the post to work correctly.
#   - please use this format rather than manually creating a markdown table of contents.
toc:
  - name: Giới thiệu
  - name: Khám phá các chuyên mục
  - name: Khoa học máy tính (Computer Science)
  - name: Toán học (Mathematics)
---

{% include figure.liquid path="assets/img/oneforall.webp" class="img-fluid" %}

> Ảnh phía trên là One for All trong bộ anime My Hero Academia. Mình xem việc chia sẻ kiến thức, viết một cái Wiki có thể xem như đang tích tụ sức mạnh và truyền cho những đời sau hehe, ngoài ra không chỉ mỗi mình mà mình mong sẽ có nhiều bạn hơn nữa cùng chung tay để có thể tạo nên sức mạnh kì tích 📚.

## Giới thiệu

Xin chào mọi người và chào mừng bạn đến với **cs4all-vn**! 👋 Mình là một sinh viên năm cuối tại VNU-HCMUS (Trường ĐH Khoa học Tự nhiên - ĐHQG HCM), và mình siêu hào hứng được chia sẻ hành trình khám phá thế giới Khoa học Máy tính (CS) cùng các bạn.

Nhiều người nghĩ CS chỉ là code và thuật toán phức tạp đúng không? Ồ, nghĩ lại nhé! 😉 CS thực ra là cả một vũ trụ bao la những điều cực kỳ hay ho và thú vị đấy!

* Bạn có tò mò làm sao máy tính có thể "học" và đưa ra dự đoán thông minh như con người không? (Đó là **Machine Learning / Deep Learning**!) 🧠
* Hay làm thế nào mà những hình ảnh trong game, phim ảnh lại trông sống động và chân thực đến vậy? (Chào mừng đến với **Computer Graphics**!) ✨
* Đã bao giờ bạn tự hỏi làm sao máy tính hiểu được những dòng code bạn viết bằng Python, Java hay C++? (Đó là nhờ các **Compiler** và lý thuyết **Programming Language** đấy!) 🤖
* Và làm sao các ứng dụng như Google, Facebook có thể xử lý hàng tỷ yêu cầu cùng lúc từ khắp nơi trên thế giới? (Sức mạnh của **Distributed Systems** và **High-Performance Computing**!) 🚀

Còn rất, rất nhiều điều tuyệt vời khác nữa!

Mình để ý thấy ở Việt Nam hiện nay, có lẽ nhiều bạn đang dồn sức rất nhiều vào việc luyện thuật toán để thi đấu (giống như các kỳ thi Olympic Tin học) hoặc tập trung xây dựng các trang web, ứng dụng (Web development, Software Engineering nói chung). Điều đó **rất tuyệt vời** và cực kỳ quan trọng nhé! Những kỹ năng đó thực sự cần thiết và mở ra nhiều cơ hội. Tuy nhiên, đôi khi mình có cảm giác là vì ánh đèn sân khấu chiếu quá sáng vào những lĩnh vực đó, chúng ta có thể vô tình bỏ lỡ hoặc chưa dành đủ sự quan tâm cho những mảng kiến thức nền tảng khác cũng không kém phần hấp dẫn và quan trọng - những mảnh ghép đã tạo nên toàn bộ ngành Khoa học Máy tính mà chúng ta biết ngày nay. Có bao giờ bạn cảm thấy như vậy không?

Và đó cũng chính là một lý do lớn thôi thúc mình xây dựng nên trang wiki này! Mình muốn "vén bức màn", giới thiệu đến các bạn bức tranh toàn cảnh hơn về CS. Thú thật là bản thân mình cũng mới chỉ tìm hiểu kỹ được một vài mảng như ML/DL, HPC và Graphics thôi. Nhưng mình có một ước mơ là xây dựng nơi này thành một thư viện mở, giống như VNOI Wiki nhưng rộng hơn về các chủ đề CS, để tất cả chúng ta – dù là học sinh, sinh viên, hay người đã đi làm – đều có thể dễ dàng tiếp cận kiến thức **bằng tiếng Việt**.

Mình tin rằng kiến thức là để sẻ chia (như "One for All" vậy đó!), và hy vọng nơi này sẽ không chỉ giúp các bạn khám phá CS mà còn kết nối những người cùng đam mê, dần dần xây dựng một cộng đồng CS thật mạnh ở Việt Nam. 💪

## Khám phá các Chuyên mục

Okay, giờ thì cùng xem chúng ta có thể khám phá những gì ở đây nhé! Tụi mình đã chia thành hai khu vực chính: Khoa học Máy tính và Toán học nền tảng.

### Khoa học Máy tính (Computer Science)

Đây là nơi chúng ta đi sâu vào các lĩnh vực chuyên ngành thú vị của CS. Đừng quên là mỗi lĩnh vực thường sẽ cần một số "vũ khí" toán học nhất định đó nha!

* ✈️ **[Học Máy (Machine Learning)](./prml)**: Cùng "chiến" cuốn sách kinh điển PRML và khám phá thế giới AI. Để đi sâu vào đây, bạn sẽ cần nắm vững **Đại số Tuyến tính, Giải tích, Xác suất Thống kê** và một chút **Tối ưu hóa** đấy!
* 🚧 **[Tính toán Hiệu năng cao (High-Performance Computing)]()**: Bạn muốn biết làm sao để tận dụng tối đa sức mạnh của card đồ họa (GPU) để tăng tốc các tác vụ tính toán nặng? Cùng khám phá lập trình GPU nhé!.
<!-- * 🚧 **[Đồ họa Máy tính (Computer Graphics)]()**: Tìm hiểu cách 'vẽ' nên những thế giới ảo sống động và các hiệu ứng hình ảnh mãn nhãn. Môn này 'ngốn' rất nhiều **Đại số Tuyến tính** (cực kỳ quan trọng!), cùng với **Giải tích** và **Hình học** đó. -->
* 🚧 **[Trình biên dịch (Compilers)]()**: Hé lộ 'phép thuật' biến những dòng code bạn viết thành ngôn ngữ máy tính có thể hiểu và thực thi. Để hiểu sâu về nó, bạn sẽ cần làm quen với **Logic toán, Lý thuyết Automata** và **Ngôn ngữ Hình thức**.
<!-- * 🚧 **[Ngôn ngữ Lập trình (Programming Languages)]()**: Khám phá cách các ngôn ngữ được thiết kế, phân loại và hoạt động, cũng như các mô hình lập trình. **Logic, Lý thuyết Tập hợp, Lý thuyết Hình thức (Type Theory)** và đôi khi **Lambda Calculus** là những chìa khóa quan trọng ở đây. -->
* 😚 **[Thuật toán (Algorithms)](https://wiki.vnoi.info/)**: Nền tảng cốt lõi của việc giải quyết vấn đề. Để rèn luyện tư duy và kỹ năng giải thuật cho các kỳ thi đấu đỉnh cao, **VNOI Wiki** là nguồn tài liệu số một không thể bỏ qua!

### Toán học (Mathematics)

Như bạn thấy ở trên, Toán học len lỏi vào mọi ngóc ngách của Khoa học Máy tính! Xây dựng một nền tảng Toán vững chắc sẽ giúp hành trình khám phá CS của bạn dễ dàng và sâu sắc hơn rất nhiều. Dưới đây là các chuyên mục Toán dự kiến sẽ có mặt:

* 🚧 **[Đại số Tuyến tính (Linear Algebra)]()**: Công cụ cực kì quan trọng cho ML, Graphics, HPC... Làm việc với vectors, ma trận, không gian đa chiều và các phép biến đổi. Không biết cái này thì hơi 'toang' nha! 😉
<!-- * 🚧 **[Tối ưu hóa (Optimization)]()**: Tìm kiếm giải pháp 'tốt nhất' (cực đại, cực tiểu) cho một vấn đề trong những điều kiện ràng buộc. Cốt lõi của việc huấn luyện hầu hết các mô hình ML. -->
* 🚧 **[Lý thuyết Tính toán (Theory of Computation)]()**: Khám phá nền tảng lý thuyết của Khoa học Máy tính! Chúng ta sẽ bắt đầu với **Lý thuyết Automata & Ngôn ngữ Hình thức** (mô hình máy trừu tượng, ngữ pháp), sau đó đi sâu vào **Tính toán được** (giới hạn của máy tính, bài toán dừng) và **Độ phức tạp** (P vs NP?). Đây là cốt lõi để hiểu bản chất của tính toán, và tụi mình dự định sẽ đi theo lộ trình của cuốn sách kinh điển **"Introduction to the Theory of Computation" của Sipser**. Rất quan trọng cho Compiler và cả việc hiểu sâu về thuật toán.

... và còn nhiều chuyên mục khác sẽ sớm ra mắt! Hãy cùng nhau học hỏi và xây dựng trang wiki này nhé!

> - 🚧: Dự định sẽ thực hiện / Sắp có.
> - ✈️: Đang thực hiện / Đang xây dựng.
> - 😚: Giới thiệu nguồn tài liệu chất lượng từ bên ngoài.