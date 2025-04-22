---
layout: distill
permalink: /prml/chapter1/prob_theory/
title: "Probability Theory"
subtitle: "PRML Chapter 1.2"
date: 2025-04-22

future: true
htmlwidgets: true
hidden: false

giscus_comments: true

bibliography: main.bib

previous_section: true
next_section: true
previous_section_url: "../polynomial_curve"
previous_section_name: "Polynomial Curve"
next_section_url: "../prob_theory/density"
next_section_name: "Probability Densities"

authors:
  - name: Lê Nguyễn
    url: "https://lenguyen.vercel.app"

toc:
  - name: Giới thiệu
  - name: Chi tiết hơn chút
  - name: Sum rule và Product rule
  - name: Quay lại bán bánh
  - name: Chi tiết hơn nữa

_styles: >
  .fake-img {
    background: #bbb;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 0px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 12px;
  }
  .fake-img p {
    font-family: monospace;
    color: white;
    text-align: left;
    margin: 12px 0;
    text-align: center;
    font-size: 16px;
  }
---

## Giới thiệu

Một hôm bạn An định mua bánh, đến chợ thì có hai bà bán bánh là bà Hoa và bà Lan. Bà Lan hiện đang còn 2 cái bánh mì và 6 cái bánh xèo, bà Hoa hiện đang còn 3 cái bánh mì và 1 cái bánh xèo.

Như mọi hôm, An thích ăn bánh của bà Hoa làm hơn, do đó ở nhiều lần đi mua trước, hết 60% trên tổng số lần bạn An đã chọn bà Hoa. Giả sử, việc An chọn bánh nào cũng như nhau (không thích bánh nào hơn bánh nào, đói thì ăn).

Trước khi vào vấn đề, ta cần hiểu một chút định nghĩa sau:

- Ta gọi tập hợp các khả năng có thể xảy ra của một **phép thử** (experiment) (ở ví dụ trên là đi mua bánh) là **không gian mẫu** (sample space) và kí hiệu là $\Omega$. Một **biến cố** (event) $A$ là một tập con của $\Omega$. Ta nói biến cố $A$ xảy ra nếu một kết quả trong $A$ xảy ra. Ví dụ, xét việc tung hai đồng xu, ta có $A = \lbrace HT, HH\rbarce$, nếu ta tung đồng xu thứ nhất được mặt ngửa ($H$) và đồng xu thứ 2 được mặt xấp ($T$) thì ta nói $A$ xảy ra.
- Xác suất của một biến cố $A$ được kí hiệu là $p(A)$ và có giá trị từ $[0, 1]$. Ta có thể định nghĩa xác suất của $A$ là **số lần thử mà $A$ xảy ra chia tổng số lần thử**.
- Một biến ngẫu nhiên $X$ hiểu đơn giản là một cách để đưa các biến cố sang các số thực (hay là một ánh xạ từ $\Omega$ sang $\R$). 
- Ngoài ra, ta nói $X$ là biến ngẫu nhiên **rời rạc** nếu tập xác định của $X$ là tập hữu hạn (như ví dụ trên $\lbrace 0, 1, \dots, 50 \rbrace$) hay vô hạn đếm được (ví dụ $\lbrace 0, 1, \dots \rbrace$). Ngược lại, ta gọi $X$ là biến ngẫu nhiên **liên tục**.

<p markdown=1 class="takeaway">Giả sử mình là cửa hàng gà rán, muốn lấy ý kiến 50 người về món gà rán đó ngon hay không, mình đặt $1$ là ngon và $0$ là dở. Nếu vậy, mình sẽ có $\|\Omega\| = 2^{50}$, mỗi lần khảo sát mình sẽ có một chuỗi $01$ với độ dài $50$ và như thế thì quá to 🥲. Nếu mình đặt $X$ là một biến ngẫu nhiên, $X$ đại diện cho số người trong $50$ người cho rằng ngon, tức là số số $1$ trong chuỗi $01$ độ dài $50$, vậy các giá trị có thể của $X$ là $\lbrace 0, 1, \dots, 50 \rbrace$. Bằng việc sử dụng biến ngẫu nhiên, mình đã giảm số khả năng từ $2^{50}$ xuống còn $51$ (ví dụ được mình lấy từ <d-cite key="CaseBerg"></d-cite> trang 54).</p>

Ok, giờ quay lại ví dụ thôi. Nếu đặt $A$ là biến ngẫu nhiên cho bà bán bánh, thì $A = h$ tức là bà Hoa, $A = l$ tức là bà Lan. Đặt $B$ là biến ngẫu nhiên cho cái bánh, $B = x$ tức là bánh xèo, còn $B = m$ tức là bánh mì. Lúc này ta có xác suất:

$$
\begin{aligned}
p(A = h) &= \frac{6}{10} \\
p(A = l) &= 1 - \frac{6}{10} = \frac{4}{10}
\end{aligned}
$$

<p markdown=1 class="takeaway">Mình lấy biến ngẫu nhiên $A$ có tập xác định là $\lbrace h, l \rbrace$, vậy nó đâu phải số thực 🤨, thế nhưng nếu xem $h = 1$ và $l = 0$ (hoặc ngược lại) thì nó cũng là số thực thôi, việc đặt chữ cho dễ hiểu hơn.</p>

Giờ đến với một kiến thức nữa. Đặt $A_1, ..., A_N$ là một hệ biến cố $N$ biến cố, nếu hệ thoả mãn 2 điều sau:
1. **Mutually exclusive** (loại trừ lẫn nhau): tức là với mỗi $A_i$ và $A_j$, nếu $A_i$ xảy ra thì $A_j$ không xảy ra và ngược lại (hay $A_i \cap A_j = \emptyset$).
2. $A_1 \cup A_2 \cup \dots \cup A_n = \Omega$.

Thì ta có:

$$
p(A_{1}) + \dots + p(A_{n}) = 1
$$

Ở ví dụ trên, ta có thể thấy $A = h$ và $A = l$ là hai biến cố loại trừ lẫn nhau (nếu đã mua bà Hoa thì không mua bà Lan, giả sử thôi nha) và giao với nhau bằng không gian mẫu, do đó:

$$
p(A = h) + p(A = l) = 1
$$

Giả sử vào hôm nay, An đi mua về một cái bánh mì, mình hỏi An đã mua từ ai, An không nói, thế nên mình đã đặt ra câu hỏi "biết rằng An đã mua cái bánh mì, vậy xác suất An mua cái bánh đó từ bà Hoa là bao nhiêu". Trước khi trả lời câu hỏi này, cùng mình đi sâu hơn một chút về xác suất.

## Chi tiết hơn chút

Xét hai biến ngẫu nhiên $X$ và $Y$, trong đó $X$ có thể nhận các giá trị $\lbrace x_1, x_2, \dots, x_M \rbrace$ và $Y$ có thể nhận các giá trị $\lbrace y_{1}, \dots, y_{L} \rbrace$. Tiếp theo ta thực hiện phép thử mà ta sẽ lấy ngẫu nhiên giá trị $X$ và $Y$. Ta thực hiện phép thử ấy trong $N$ lần, trong đó số lần thử mà $X = x_i$ và $Y = y_j$ xảy ra là $n_{ij}$.

{% include figure.liquid path="assets/img/prml/image1.png" class="img-fluid" caption="Hình 1: Visualization xác suất của X và Y trong sách gốc" %}

<p class="takeaway">Dựa vào hình, nếu ta xem mỗi hai biến ngẫu nhiên $X$ và $Y$ tạo nên hộp có các ô như trên. Ta xem mỗi lần thử là một viên bi, cứ một lần thử, ta sẽ thả một viên bi vào hộp trên, vậy trong $N$ lần thử, ta sẽ có $N$ viên bi nằm ở các ô ngẫu nhiên trong hộp. Vậy xác suất để một lần thử có $X = x_i$ và $Y = y_j$ chính là tỉ lệ giữa số bi nằm trong ô $X = x_i$ và $Y = y_j$ (là $n_{ij}$) với tổng viên bi (là $N$).</p>

<p mardown=1 class="takeaway">Ta đọc dấu $,$ trong công thức xác suất đồng thời là "và", tức là $p(X = x_i, Y = Y_j)$ sẽ đọc là "xác suất của $X = x_i$ và $Y = y_j$". Do là phép "và" nên có tính đối xứng, nghĩa là $p(X =x_i, Y = y_j) = p(Y = y_j, X = x_i)$. Hiểu một cách khác thì ô $i, j$ hay ô $j, i$ đều như nhau nên số viên bi tại đó là bằng nhau.</p>

Ta gọi xác suất mà $X = x_i$ và $Y = y_j$ cùng xảy ra là **xác suất đồng thời** của $X = x_i$ và $Y = y_j$, kí hiệu là $p(X = x_i, Y = y_j)$.  Như đã nói ở trên, $p(X = x_i, Y = y_j)$ chính là số lần thử mà $X = x_i$ và $Y = y_j$ xảy ra ($n_{ij}$) chia cho tổng số lần thử ($N$). Xác suất này được tính như sau:

$$
p(X = x_{i}, Y = y_{j}) = \frac{n_{ij}}{N}
$$

Tương tự, xác suất mà $X = x_i$ không quan tâm $Y$ bao nhiêu là $p(X = x_{i})$ và được tính như sau:

$$
p(X = x_{i}) = \frac{c_{i}}{N}
$$

điều này cũng dễ hiểu, ta sẽ đếm số viên bi nằm trong cột $X = x_i$ rồi chia cho toàn bộ bi, gọi số bi ấy là $c_i$. Ngoài ra ta thấy $\sum_{i} c_{i} = N$, do đó:

$$
\sum_{i=1}^L p(X = x_{i}) = 1
$$

có thể thấy, tổng của xác suất là bằng $1$.

<p class="takeaway">Việc $\sum_{i} c_{i} = N$ là bởi vì khi ta thả bi vào hộp, bi chắc chắn phải nằm ít nhất một trong các giá trị $x_i$ với $i = 1, \dots, L$. Ta không cần quan tâm tới $Y$ nhé, cứ tưởng tượng hộp của chúng ta không có các ô ngang nữa (bỏ đi $Y$) chỉ có các ô dọc của $X$ (chỉ có các giá trị $c_i$) khi đó tổng các ô dọc lại, ta sẽ có được cả hộp (tức là sẽ có được tổng số bi). Tương tự với $Y$, ta bỏ đi $X$ (ô dọc), hộp chỉ còn các ô ngang, do đó $\sum_{j} r_{j} = N$.</p>

Hơn nữa, ta thấy $c_i$ chính là tổng của các ô có $X = x_i$ và $Y = y_j$ với $j$ tuỳ ý (tức là tổng từng ô nhỏ tạo thành hàng dọc tại vị trí $X = x_j$):

$$
\begin{align}
c_{i} &= \sum_{j=1}^M n_{ij} \\
\implies p(X = x_{i}) &=  \frac{\sum_{j=1}^M n_{ij}}{N} \\
&= \sum_{j=1}^M \frac{n_{ij}}{N} \\
&= \sum_{j=1}^M p(X = x_{i}, Y = y_{j})
\end{align}
$$

Công thức phía trên chính là **sum rule** trong xác suất. Ngoài ra $p(X = x_{i})$ đôi khi còn được gọi là **marginal probability** (xác suất biên) bởi vì $p(X = x_i)$ có được bằng cách tổng các biến khác (ở đây là $Y$) (còn có thể gọi cách tổng này là *marginalizing*, tìm xác suất biến ta cần bằng cách tổng các biến còn lại).

Giả sử ta chỉ xét nhưng viên bi nằm ở hàng dọc $X = x_i$ (tức là ta không cần quan tâm đến cái hộp to nữa, chỉ cần quan tâm một ô dọc của cái hộp thôi), khi đó tỉ lệ những viên bi nằm ở ô $Y = y_j$ được viết là $p(Y = y_{j} \mid X = x_{i})$. Xác suất này được gọi là **conditional probability** (xác suất có điều kiện) của $Y = y_{j}$ biết (given) $X = x_i$ và có công thức như sau:

$$
p(Y = y_{j} \mid X = x_{i}) =  \frac{n_{ij}}{c_{i}}
$$

Ta lại có $\sum_{j} n_{ij} = c_{i}$ (cách này giải thích giống như $\sum_{i} c_{i} = N$ ở phía trên) do đó:

$$
\sum_{j = 1}^M p(Y = y_{j} \mid X = x_{i}) = \sum_{j=1}^M \frac{n_{ij}}{c_{i}} = 1
$$

Từ công thức của xác suất có điều kiện, ta thấy:

$$
\begin{align}
p(Y = y_{j} \mid X = x_{i}) &= \frac{n_{ij}}{c_{i}} \\
&= \frac{n_{ij}}{N} \frac{N}{c_{i}} \\
&= \frac{P(X = x_{i}, Y = y_{j})}{P(X = x_{i})} \\ 
\implies P(X = x_{i}, Y = y_{j}) &= P(Y = y_{j} \mid X = x_{i})P(X = x_{i})
\end{align}
$$

Công thức phía trên chính là **product rule** của xác suất.

<p class="takeaway">Có thể hiểu xác suất điều kiện của $Y = y_j$ biết $X =x_i$ là ta sẽ giới hạn số viên bi được xét lại, ở xác suất $p(Y = y_j)$ ta được xét toàn bộ viên bi $N$, thế nhưng ở $p(Y = y_j \mid X = x_i)$ ta chỉ xét trên những số viên bi nằm ở hàng dọc $X = x_i$. Nói cách khác xác suất có điều kiện giới hạn không gian mẫu lại.</p>

## Sum rule và product rule

<p markdown=1 class="takeaway">Ta sẽ hiểu $p(X)$ hay $p(Y)$ là một hàm (hay còn gọi là **distribution**) của biến ngẫu nhiên $X$ hoặc $Y$, trong khi đó $p(X = x_i)$ là phân phối $p(X)$ tại giá trị $X = x_i$, tương tự với $p(Y = y_j)$. Ngoài ra ta cũng có thể hiểu $p(X)$ tương đương với $p(X = x)$ với $x$ là một giá trị bất kỳ.</p>

<p markdown=1 class="definition">
**Định nghĩa 1** (Sum rule):
\\[
p(X) = \sum_{Y} P(X, Y)
\\]
</p>

<p markdown=1 class="definition">
**Định nghĩa 2** (Product rule):
\\[
p(X, Y)  = p(Y \mid X)P(X)
\\]
</p>

Từ sum rule và product rule, ta lại có:

$$
p(Y \mid X) = \frac{p(X, Y)}{p(X)} = \frac{p(Y,X)}{p(X)} = \frac{p(X \mid Y)p(Y)}{p(X)}
$$

và công thức phía trên được gọi là định lý Bayes (Bayes' Theorem).

<p markdown=1 class="definition">
**Định nghĩa 3** (Bayes' Theorem):
\\[
p(Y \mid X) = \frac{p(X \mid Y)p(Y)}{p(X)}
\\]
Có thể thấy Bayes' Theorem nối hai xác suất điều kiện lại với nhau, đó là $P(Y \mid X)$ và $P(X \mid Y)$. Đây chính là điều siêu quan trọng mà sẽ được dùng rất nhiều về sau.
</p>

## Quay lại bán bánh

Giờ quay về ví dụ mua bánh xèo nhé. Như ta đã biết:

$$
\begin{aligned}
p(A = h) &= \frac{6}{10} \\
p(A = l) &= \frac{4}{10}
\end{aligned}
$$

Tiếp theo, nếu ta đã chọn mua bà Lan, vậy xác suất ta chọn được cái bánh xèo chính là số bánh xèo bà Lan có chia cho tổng số bánh:

$$
p(B = x \mid A = l) = \frac{6}{8} = \frac{3}{4}
$$

Tương tự với các xác suất còn lại:

$$
\begin{aligned}
p(B = m \mid A = l) &= \frac{2}{8} = \frac{1}{4}\\
p(B = x \mid A = h) &= \frac{1}{4} \\
p(B = m \mid A = h) &= \frac{3}{4}
\end{aligned}
$$

Để tìm được xác suất An sẽ mua bánh mì (không quan tâm mua từ bà bán bánh nào), ta sẽ dùng sum rule và product rule:

$$
\begin{aligned}
p(B = m) &= p(B = m, A = l) + p(B = m, A = h) \\
&= p(B = m \mid A = l)p(A = l) + p(B = m \mid A = h)p(A = h) \\
&= \frac{1}{4} \frac{4}{10} + \frac{3}{4} \frac{6}{10} = \frac{11}{20}
\end{aligned}
$$

Tương tự mình cũng có xác suất An sẽ mua bánh xèo (không quan tâm bà bán):

$$
p(B = x) = 1 - p(B = m) = \frac{9}{20}
$$

Bây giờ đến lúc trả lời câu hỏi mình đã đặt ra, xác suất để An mua cái bánh xèo đó từ bà Hoa là bao nhiêu ? Tức là mình đã biết trước An mua cái bánh xèo ($B = x$) và tìm xác suất mua từ bà Hoa dựa trên đó ($A = h$) $\implies$ Mình cần tìm $p(A = h \mid B = x)$, do đó áp dụng định lý Bayes:

$$
\begin{aligned}
p(A = h \mid B = x) &= \frac{p(B = x \mid A = h)p(A = h)}{p(B = x)} \\
&= \dfrac{1 / 4 \times 6 / 10 }{9 / 20} = \frac{1}{3}
\end{aligned}
$$

Tương tự, mình cũng có xác suất An mua cái bánh xèo đó từ bà Lan:

$$
p(A = l \mid B = x) = 1 - \frac{1}{3} = \frac{2}{3}
$$

Vậy có thể thấy, mặc dù yêu thích bà Hoa hơn, nhưng khả năng An chọn mua cái bánh xèo từ bà Lan lại cao hơn.

## Chi tiết hơn nữa

<p markdown=1 class="takeaway">Trong bài toán trên, ta có thể formal nó thành $p(A \mid B)$, trong đó $p(A)$ sẽ là xác suất tiên nghiệm. Trước khi biết An mua cái bánh nào, thì khi được hỏi An sẽ mua bánh từ bà bán bánh nào, thông tin duy nhất ta biết là An thích bà bán bánh nào hơn, tức là chỉ biết được $p(A)$. Thế nhưng sau khi ta biết được An đã mua cái bánh nào, thì khi được hỏi An sẽ mua bánh từ bà bán bánh nào, ta có thể dùng công thức Bayes để tính ra, do đó xác suất $p(A \mid B)$ được gọi là xác suất hậu nghiệm, bởi vì ta có được xác suất này sau khi *quan sát* được An đã mua cái bánh nào (bằng chứng $B$).  Có thể thấy, bà Lan sẽ có số bánh xèo nhiều hơn do đó việc quan sát rằng An đã chọn mua bánh xèo sẽ khiến quyết định nghĩ rằng An mua từ bà Lan đã cao hơn.</p>

Trong công thức Bayes của $p(X \mid Y)$, ta gọi $p(X)$ là **xác suất tiên nghiệm** (prior probability), $p(Y \mid X)$ là **likelihood**, $p(Y)$ được gọi là **xác suất biên** (marginal probability), $Y$ được gọi là **bằng chứng** (evidence), $X$ được gọi là **giả thiết** (hypothesis) và $p(X \mid Y)$ là **xác suất hậu nghiệm** (posterior probability). 

Nếu một xác suất đồng thời $p(X, Y)$ có thể đưa về thành tích của hai xác suất biên $p(X)$ và $p(Y)$, nghĩa là:

$$
p(X, Y) = p(X)p(Y)
$$

thì ta nói $X$ với $Y$ **độc lập** (independent) với nhau.

Nếu $X$ với $Y$ độc lập với nhau thì:

$$
p(X \mid Y) = \frac{p(X, Y)}{p(Y)} = p(X)
$$

tức là xác suất của $X$ cho dù biết $Y$ hay không thì cũng không bị ảnh hưởng. Suy ngược lại, nếu $p(X \mid Y) = p(X)$ (tương tự $p(Y \mid X) = p(Y)$) thì ta nói $X$ và $Y$ độc lập với nhau.