---
layout: distill
permalink: /prml/chapter1/polynomial_curve
title: "Polynomial Curve Fitting"
subtitle: "PRML Chapter 1.1"
date: 2025-04-22
future: true
htmlwidgets: true
hidden: false
giscus_comments: true

previous_section: true
next_section: true
previous_section_url: "/cs4all-vn/prml/"
previous_section_name: "Trang chính"
next_section_url: "/cs4all-vn/prml/chapter1/prob_theory"
next_section_name: "Probability Theory"

authors:
  - name: Lê Nguyễn
    url: "https://lenguyen.vercel.app"

toc:
  - name: Giới thiệu bài toán
  - name: Làm sao để tìm mô hình phù hợp
  - name: Chọn giá trị hyperparameter
---

## Giới thiệu bài toán

Giả sử bạn An có số tiền là $x \in \mathbb{R}$ và LN muốn dự đoán xem với số tiền $x$ này, An có thể mua được bao nhiêu cái bánh xèo, bởi vì bà bán bánh xèo bả không muốn tiết lộ giá 1 cái bánh xèo và giá có thể thay đổi mỗi ngày (nhưng bánh xèo ngon). Gọi số bánh xèo mua được là $y \in \mathbb{R}$ (trong thực tế số bánh sẽ là số nguyên, nhưng mà mình giả sử bà bán bánh có khả năng nào đó bán được số bánh xèo là số thực).

<p markdown=1 class="takeaway">Bài toán dùng một giá trị đầu vào $$x$$ để dự đoán một giá trị số thực $$y$$ nào đó được gọi là bài toán **hồi quy** (regression).</p>

Giả sử An thu thập dữ liệu cho việc dự đoán của mình thông qua $N$ lần mua, đặt là $\mathbf{x} \equiv (x_1, ..., x_N)^T$. Với mỗi $x_i$, An biết được số bánh xèo mua được là $y_i$, vậy ta có $\mathbf{y} \equiv (y_1, ..., y_N)^T$. Ta gọi dữ liệu mà An thu thập được $\{ (x_1, y_1), ..., (x_N, y_N) \}$ là **tập huấn luyện** (training set). Dựa trên tập huấn luyện ấy, An muốn dự đoán giá trị $\hat{y}$ cho một giá trị $\hat{x}$ mới (lần mua mới). Vì vậy An cần tìm ra một mô hình (hay quy luật) nào đó, để khi đưa vào giá trị $\hat{x}$ nào đó (gọi là input), mô hình cho ra được giá trị $\hat{y}$ phù hợp (gọi là output).

An đoán rằng, việc dùng một hàm đa thức như dưới có thể dự đoán được số bánh:

$$
f(x, \mathbf{w}) = w_{0} + w_{1}x + w_{2}x^2 + \dots w_{M}x^M = \sum_{i=0}^M w_{i}x^i
$$

trong đó $\mathbf{w} = (w_0, w_1, ..., w_M)^T$ là bộ tham số của hàm đa thức $f(x, \mathbf{w})$ mà An chọn và $M$ là **bậc** (degree) của đa thức ấy. Vậy có hai thứ mà ta cần để ý khi dùng đa thức (hay mô hình) này, đó chính là $M$ và $\mathbf{w}$, để tìm được mô hình phù hợp với dữ liệu đã có, ta cần tìm $\mathbf{w}$ và $M$ phù hợp.

<p markdown=1 class="takeaway">Mặc dù $f(x, \mathbf{w})$ là một hàm không tuyến tính của $x$ nhưng lại là một hàm tuyến tính của $\mathbf{w}$, vì vậy ta có thể xem bài toán này là một bài toán **hồi quy tuyến tính** (linear regression) bởi vì đây là bài toán regression và ta dùng mô hình linear 🤯.</p>

## Làm sao để tìm mô hình phù hợp

Để tìm được $\mathbf{w}$ phù hợp với dữ liệu, ta cần một hàm để đánh giá xem, liệu giá trị $\mathbf{w}$ mà ta chọn **tốt hay là không** (không tốt thì chọn lại, chọn nào tốt thì thôi 👌). Hàm đánh giá đó được gọi là **hàm lỗi** (error function), kí hiệu $E(\mathbf{w})$, $E(\mathbf{w})$ càng thấp (lỗi càng ít) thì $\mathbf{w}$ càng phù hợp với dữ liệu, do đó mục tiêu tối thượng 😤 là phải tìm giá trị $\mathbf{w}^\star$ sao cho $E(\mathbf{w}^\star)$ là nhỏ nhất.

Với mỗi loại bài toán khác nhau thì ta sẽ chọn error function khác nhau. Để cho dễ, mình sẽ chọn hàm lỗi như sau:

$$
E(\mathbf{w}) = \frac{1}{2} \sum_{i=1}^N [f(x_{i}, \mathbf{w}) - y_{i}]^2
$$

ta có thể hiểu hàm lỗi này là tổng bình phương độ lỗi (hay độ khác nhau) giữa số bánh dự đoán $f(x_i, \mathbf{w})$ và số bánh thực sự mua được $y_i$. Ngoài ra $E(\mathbf{w}) = 0$ khi và chỉ khi $f(x_{i}, \mathbf{w}) = y_{i} \hspace{3pt} \forall i = 1\dots N$, nghĩa là không có lỗi nào ở đây, $f(x, \mathbf{w})$ *khớp* (fit) hoàn toàn với dữ liệu.

Với hàm lỗi như trên, ta hoàn toàn có thể tìm được giá trị $\mathbf{w}^\star$ bởi vì $f(x_i, \mathbf{w})$ là một hàm tuyến tính nên $[f(x_{i}, \mathbf{w}) - y_{i}]^2$ là một hàm bậc 2, do đó đạo hàm của $E(\mathbf{w})$ theo $w_i$ lại là một hàm tuyến tính, vì vậy (gần như) tồn tại một nghiệm duy nhất và nghiệm sẽ là giá trị mà ta cần tìm.

$$
\begin{align}
\dfrac{\partial E(\mathbf{w})}{\partial \mathbf{w}} = \begin{bmatrix}
\dfrac{\partial{E(\mathbf{w})}}{\partial w_{0}} \dots 
\dfrac{\partial{E(\mathbf{w})}}{\partial w_{N}}
\end{bmatrix}^T &= 0 \\
\implies \dfrac{\partial E(\mathbf{w})}{\partial w_{i}} = 0 \hspace{5pt} \forall i=0 ... N
\end{align}
$$

Vì vậy, kết quả mà thoả mãn phương trình trên, gọi là $$\mathbf{w}^\star$$, là giá trị làm cho error function nhỏ nhất. Vậy vấn đề tiếp theo là cần tìm $$M$$ phù hợp nữa thôi. Ngoài ra $$M$$ không nằm trong bộ tham số $$\mathbf{w}$$ của mô hình nên ta còn có thể gọi $$M$$ là **hyperparameter** (siêu tham số) của mô hình.

### Chọn giá trị hyperparameter 

NOTE: Phần này mình nghĩ các bạn nên tự đọc, khá hay và nhiều insight, một phần vì mình cũng lười 😿.
