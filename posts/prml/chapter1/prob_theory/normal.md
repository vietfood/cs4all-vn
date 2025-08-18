---
layout: distill
permalink: /prml/chapter1/prob_theory/normal
title: "Gaussian Distribution"
subtitle: "PRML Chapter 1.2.4"
date: 2025-04-23

future: true
htmlwidgets: true
hidden: false

giscus_comments: true

bibliography: main.bib

previous_section: true
next_section: true

previous_section_url: "/cs4all-vn/prml/chapter1/prob_theory/bayes"
previous_section_name: "Bayesian Probabilities"
next_section_url: "/cs4all-vn/prml/chapter1/prob_theory/curve_revisit"
next_section_name: "Curve Fitting Revisited"


authors:
  - name: Lê Nguyễn
    url: "https://lenguyen.vercel.app"

toc:
  - name: Lý thuyết
  - name: Chứng minh trung bình và phương sai mẫu
---

## Lý thuyết

<p markdown=1 class="definition">
**Phân phối chuẩn** (Gaussian Distribution hoặc Normal Distribution), kí hiệu là $\mathcal{N}(x \mid \mu, \sigma^2)$, sẽ được định nghĩa như sau:
\\[
\mathcal{N}(x \mid \mu, \sigma^2) = \frac{1}{(2\pi \sigma^2)^{1/2}} \exp \left\\{ - \frac{1}{2\sigma^2} (x - \mu)^2 \right\\}
\\]
Với $x$ là số thực và $\mathcal{N}(x \mid \mu, \sigma^2)$ có nghĩa là phân phối gồm 2 tham số là $\mu$ và $\sigma^2$, trong đó $\mu$ là **trung bình** (mean) của phân phối, $\sigma^2$ là **phương sai** (variance) của phân phối.
</p>

Ngoài ra, nếu lấy căn của phương sai, ta được $\sigma$ và ta gọi giá trị đó là **độ lệch chuẩn** (standard deviation) của phân phối. Còn nếu lấy nghịch đảo của phương sai và đặt giá trị đó là $\beta$, tức là $\beta = 1/(\sigma^2)$, ta gọi $\beta$ là **độ chính xác** (precision) của phân phối.

<p markdown=1 class="takeaway">
Khi ta nói một biến ngẫu nhiên liên tục $X$ nào đó có phân phối $f$ với các tham số $\theta_{i}$, ta kí hiệu $X \sim f(\theta_{1}, \theta_{2}, \dots)$. Ví dụ, $X$ có phân phối chuẩn với trung bình là $\mu$ và phương sai là $\sigma^2$ thì ta viết $X \sim \mathcal{N}(\mu, \sigma^2)$. Ngoài ra khi viết $X$ có phân phối, ta ngầm hiểu phân phối đó là mật độ xác suất (pdf) (đối với biến liên tục) của $X$.
</p>

{% include figure.liquid path="https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Normal_Distribution_PDF.svg/2560px-Normal_Distribution_PDF.svg.png" class="img-fluid" caption="Hình 1: Đồ thị của phân phối chuẩn, có thể thấy đồ thị có dạng tháp chuông (nguồn: Wikipedia)" %}

Ta có kì vọng của một biến ngẫu nhiên $X \sim \mathcal{N}(\mu, \sigma^2)$ là:

$$
\mathbb{E}[X] = \int_{-\infty}^{\infty} \mathcal{N}(x \mid \mu, \sigma^2)x dx = \mu
$$

Vậy kì vọng của $X$ chính là giá trị trung bình của phân phối. Ngoài ra, ta có:

$$
\mathbb{E}[X^2] = \int_{-\infty}^{\infty} \mathcal{N}(x \mid \mu, \sigma^2)x^2 dx = \mu^2 + \sigma^2
$$

Ta gọi giá trị $\mathbb{E}[X^2]$ là **moment bậc 2** (second order moment) của $X$. Tương tự moment bậc $k$ của $X$ sẽ là $\mathbb{E}[X^k]$. Từ hai phương trình trên, ta có phương sai của $X$ là:

$$
\text{var}[X] = \mathbb{E}[X^2] - \mathbb{E}[X]^2 = \sigma^2
$$

Giá trị lớn nhất $x$ làm cho phân phối cực đại còn được gọi là **mode** và phân phối chuẩn có $mode = \mu$, tức là:

$$
\text{arg}\max_{x} \mathcal{N}(x \mid \mu, \sigma^2) = \mu
$$

<p markdown=1 class="takeaway">
Các công thức trên đều được chứng minh ở phần bài tập.
</p>

Xét một vector $D$ chiều gồm các số thực $\mathbf{x} =(x_{1}, \dots, x_{D})^T$. Ta định nghĩa phân phối chuẩn trên vector $\mathbf{x}$ là:

$$
\mathcal{N}(\mathbf{x} \mid \pmb{\mu}, \pmb{\Sigma}) = \frac{1}{(2\pi)^{D/2}} \frac{1}{|\pmb{\Sigma}|^{1/2}} \exp \left\{ -\frac{1}{2} (\mathbf{x} - \pmb{\mu})^T \pmb{\Sigma}^{-1} (\mathbf{x} - \pmb{\mu}) \right\}
$$

Trong đó $\pmb{\mu}$ là vector trung bình của phân phối có $D$ chiều, $\pmb{\Sigma}$ là ma trận hiệp phương sai có kích thước $D \times D$ và $\mid\pmb{\Sigma}\mid$ là định thức của ma trận hiệp phương sai $\pmb{\Sigma}$. Một tên gọi khác cho phân phối chuẩn nhiều chiều là **multivariate normal (hoặc gaussian) distribution**.

Giả sử ta có một tập dữ liệu $\mathcal{D} = \lbrace x_{1}, \dots, x_{N}\rbrace$. Tập dữ liệu bao gồm $N$ quan sát, mỗi quan sát (observation) là một đại lượng vô hướng (scalar) $x_{i}$.

<p class="takeaway" markdown=1>
Ta gọi một giá trị $x$ là scalar nếu nó không phải là vector (ez huh). Đúng hơn, scalar (hay đại lượng vô hướng) để chỉ phần tử của một trường (field) ([Scalar (mathematics) - Wikipedia](https://en.wikipedia.org/wiki/Scalar_(mathematics))). Tập số thực ($\mathbb{R}$) là một trường, do đó ta có thể nói các số thực $x \in \mathbb{R}$ là một đại lượng vô hướng. Ngoài ra, tập số phức $\mathbb{C}$ cũng là một trường nên $x$ cũng có thể là số phức nếu ta chỉ nói $x$ là đại lượng vô hướng mà không nói gì thêm.
</p>

Giả sử các quan sát trong tập dữ liệu $\mathcal{D}$ của ta được lấy ra một cách độc lập (drawn independently) từ một phân phối chuẩn có trung bình là $\mu$ và phương sai là $\sigma^2$ (đây là hai đại lượng mà ta chưa biết và mục đích của chúng ta là tìm ra được hai tham số này từ tập dữ liệu mà ta có).

Các điểm dữ liệu mà:
- Được lấy ra từ cùng một phân phối (identically distributed).
- Độc lập với nhau (independent).

thì được nói là **độc lập và có phân phối đồng nhất** (independent and identically distributed) và thường viết tắt là i.i.d.

<p class="takeaway" markdown=1>
Xét tập dữ liệu $\mathcal{D}$, nếu ta viết $\mathcal{x_i} \overset{i.i.d}{\sim} \mathcal{N}(\mu, \sigma^2), i = 1...N$ tức là tập dữ liệu $\mathcal{D}$ là độc lập và có phân phối đồng nhất, ngoài ra $\mathcal{D}$ được lấy ra từ phân phối chuẩn.
</p>

Xét hàm likelihood $\mathcal{L}(\mu, \sigma^2 \mid \mathcal{D})$, bởi vì $\mathcal{D}$ là i.i.d nên ta có:

$$
\mathcal{L}(\mu, \sigma^2 \mid \mathcal{D}) = p(\mathcal{D} \mid \mu, \sigma^2) = p(x_{1}, \dots, x_{N} \mid \mu, \sigma^2) = \prod_{n=1}^N p(x_{n} \mid \mu, \sigma^2)
$$

Một trong những cách thường dùng để tìm các tham số cho phân phối bằng cách sử dụng tập dữ liệu quan sát được ($\mathcal{D}$) là tìm các tham số mà **làm cực đại** hàm likelihood (hay còn gọi là **maximum likelihood**). Hay nói cách khác:

$$
\hat{\mu}, \hat{\sigma}^2 = \text{arg}\max_{\mu, \sigma^2} \mathcal{L}(\mu, \sigma^2 \mid \mathcal{D})
$$

<p class="takeaway" markdown=1>
Kí hiệu $\displaystyle \text{arg}\max_{x} f(x)$ có nghĩa là giá trị $x$ sao cho $f(x)$ là lớn nhất (cực đại).
</p>

Đễ dễ dàng hơn, thay vì tìm các tham số làm cực đại hàm likelihood, ta tìm các tham số làm cực đại hàm log (log ở đây sẽ được hiểu là $\ln$) của hàm likelihood, nghĩa là:

$$
\hat{\mu}, \hat{\sigma}^2 = \text{arg}\max_{\mu, \sigma^2} \ln \mathcal{L}(\mu, \sigma^2 \mid \mathcal{D})
$$

Do đó, ta có thể viết hàm likelihood lại như sau:

$$
\begin{aligned}
\ln \mathcal{L}(\mu, \sigma^2 \mid \mathcal{D}) &= \ln \prod_{n=1}^N p(x_{n} \mid \mu, \sigma^2) \\
&= \left[-\frac{1}{2\sigma^2} \sum_{n=1}^N (x_{n} - \mu)^2 \right] - \frac{N}{2} \ln 2\pi - \frac{N}{2}\ln \sigma^2
\end{aligned}
$$

Cực đại hàm log likelihood phía trên theo $\mu$, ta có:

$$
\mu_{ML} = \frac{1}{N} \sum_{n=1}^N x_{n}
$$

trong đó $\mu_{ML}$ được gọi là **trung bình mẫu** (sample mean) tức là trung bình của các quan sát $\{x_n\}$ mà ta quan sát được. Còn nếu ta cực đại theo $\sigma^2$, ta có:

$$
\sigma^2_{ML} = \frac{1}{N} \sum_{n=1}^N (x_{n} - \mu_{ML})^2
$$

Ta gọi $\sigma_{ML}^2$ là **phương sai mẫu** (sample variance), ngoài ra ta thấy $\sigma_{ML}^2$ cũng phụ thuộc vào $\mu_{ML}$. Về lý thuyết là ta cần tính cả hai cùng lúc (tìm bộ tham số làm cực đại, mà bộ tham số gồm $n$ biến thì tìm cùng lúc $n$ biến) thế nhưng trong trường hợp này, $\mu_{ML}$ không phụ thuộc vào $\sigma_{ML}^2$ do đó ta có thể tìm $\mu_{ML}$ trước sau đó tìm $\sigma_{ML}^2$.

<p class="takeaway" markdown=1>
Thông thường giá trị trung bình $\mu$ được gọi trung bình tổng thể (population mean) tương tự với $\sigma^2$ là phương sai tổng thể (population variance), đây là giá trị mà ta không biết, thế nhưng bằng cách dùng một phần của tổng thể (gọi là mẫu), ta sẽ cố gắng ước lượng được giá trị $\mu$ với $\sigma^2$ tốt nhất. Như đã chứng minh phía trên, giá trị ước lượng tốt nhất chính là $\mu_{ML}$ (trung bình của mẫu) và $\sigma^2_{ML}$ (phương sai của mẫu).
</p>

Xét giá trị kì vọng của trung bình mẫu $\mu_{ML}$, ta có:

$$
\mathbb{E}[\mu_{ML}] = \mu
$$

Có thể thấy, kì vọng của trung bình mẫu $\mu_{ML}$ chính là trung bình của phân phối $\mu$, đúng như ta dự đoán, giá trị $\mu_{ML}$ có thể được dùng ước lượng rất tốt $\mu$. Thế nhưng, nếu xét giá trị kì vọng của phương sai mẫu $\sigma^2_{ML}$, ta có:

$$
\mathbb{E}[\sigma^2_{ML}] = \frac{(N-1)}{N} \sigma^2
$$

Mặc dù ước lượng tốt với $\mu_{ML}$ thế nhưng $\sigma_{ML}^2$ thì không. Dùng $\sigma_{ML}^2$ để ước lượng cho $\sigma^2$ thì cho ra giá trị thấp hơn, ta gọi cách ước lượng này là **đánh giá thấp** (underestimate) (hay còn gọi là bias). Để tránh việc bias như này, ta chỉ cần chia cho $N-1$ thay vì $N$ ở phương sai mẫu:

$$
\begin{aligned}
\sigma^2_{ML} &= \frac{1}{N-1} \sum_{n=1}^N (x_{n} - \mu_{ML})^2 \\
\implies \mathbb{E}[\sigma^2_{ML}] &= \sigma^2
\end{aligned}
$$

Và đây là lý do mà người ta thường chia cho $N-1$ thay vì $N$ ở phương sai mẫu.

Thế nhưng khi $N$ trở lên lớn dần, việc bias của nghiệm của maximum likelihood ($\sigma_{ML}^2$) không còn quá quan trọng nữa (ví dụ bạn có $N = 100001$ thì $N - 1 = 100000$ sẽ cho ra kết quả không quá chênh lệch). Khi mà $N \to \infty$ thì phương sai mẫu $\sigma_{ML}^2$ sẽ tiến dần về phương sai thực sự $\sigma$ của phân phối. Trong thực tế, nếu $N$ không nhỏ thì bias không phải là một vấn đề quan trọng lắm.

<p class="takeaway" markdown=1>
Việc phương sai mẫu $\sigma^2_{ML}$ tiến dần về phương sai thực sự $\sigma$ của phân phối khi mà $N \to \infty$ được chứng minh cụ thể ở **luật số lớn** (Law of Large Number) <d-footnote>Law of large numbers - Wikipedia (https://en.wikipedia.org/wiki/Law_of_large_numbers)</d-footnote>.
</p>

Tuy nhiên với các mô hình ML phức tạp có nhiều tham số thì vấn đề bias này lại trở nên nghiêm trọng. Ở các phần sau, tác giả sẽ cho thấy vấn đề bias của maximum likelihood là một trong những nguyên nhân gây ra over-fitting.

## Chứng minh trung bình và phương sai mẫu

<p class="takeaway"> Phần này optional, mình chứng minh chỉ để hiểu hơn thôi </p>

Xét 1 mẫu $\mathcal{D}$ gồm $N$ quan sát ${} x_{1}, \dots, x_{N} {}$ và $\mathcal{D} \overset{i.i.d}{\sim} \mathcal{N}(\mu, \sigma^2)$. Đặt $\mu_{ML}$ là trung bình mẫu và $\sigma^2_{ML}$ là phương sai mẫu.

### Trung bình mẫu

Ta có:

$$
\begin{aligned}
\mathbb{E}[\mu_{ML}] &= \mathbb{E}\left[ \frac{1}{N} \sum_{n=1}^N x_{n} \right] \\
&= \frac{1}{N} \sum_{n=1}^N \mathbb{E}[x_{n}] \\
&= \frac{1}{N} \sum_{n=1}^N \mu \\
&= \mu
\end{aligned}
$$

### Phương sai mẫu

Ta có:

$$
\begin{aligned}
\mathbb{E}[\sigma^2_{ML}] &= \mathbb{E}\left[ \frac{1}{N} \sum_{n=1}^N (x_{n} - \mu_{ML})^2 \right] \\
&= \frac{1}{N} \sum_{n=1}^N \mathbb{E}[x_{n}^2 -2x_{n}\mu_{ML} + \mu_{ML}^2] \\
&= \frac{1}{N} \sum_{n=1}^N \mathbb{E}[x_{n}^2] -2\mathbb{E}[x_{n}\mu_{ML}] + \mathbb{E}[\mu_{ML}^2] \\
\end{aligned}
$$

Như đã biết ở trước đó thì moment bậc 2 của phân phối chuẩn sẽ có giá trị là $\mathbb{E}[X^2] = \mu^2 + \sigma^2$. Còn giá trị $\mathbb{E}[x_n\mu_{ML}]$ sẽ được tính như sau (nhớ là các quan sát độc lập với nhau, do đó với hai quan sát $x_i$ và $x_j$ bất kì, ta có $\mathbb{E}[x_ix_j] = \mathbb{E}[x_i]\mathbb{E}[x_j]$):

$$
\begin{aligned}
\mathbb{E}[x_{n}\mu_{ML}] &= \mathbb{E}\left[ \frac{1}{N} \sum_{i=1}^N x_n x_{i} \right] \\
&= \frac{1}{N} \left[ \sum_{i \neq n} \mathbb{E}[x_{n}x_{i}] + \mathbb{E}[x_{n}^2] \right] \\
&= \frac{1}{N} \left[ (N-1)\mu^2 + \mu^2 + \sigma^2 \right] \\
&= \mu^2 + \frac{\sigma^2}{N}
\end{aligned}
$$

Ta chỉ cần tính giá trị còn lại là $\mathbb{E}[\mu_{ML}^2]$. Trước tiên ta cần biết công thức sau:

$$
\left( \sum_{n=1}^N x_{n} \right)^2 = \sum_{n=1}^N x_{n}^2 + \sum_{j=1}^N\sum_{i \neq j}^N x_i x_j
$$

Chứng minh này công thức này mình thua (các bạn có thể xem thêm ở <d-footnote>https://math.stackexchange.com/questions/329344/what-is-the-square-of-summation</d-footnote>). Sau khi có công thức rồi thì tính thôi nào:

$$
\begin{aligned}
\mathbb{E}[\mu_{ML}^2] &= \mathbb{E}\left[ \frac{1}{N^2} \left( \sum_{n=1}^N x_{n} \right)^2 \right] \\
&= \frac{1}{N^2} \mathbb{E}\left[ \sum_{n=1}^N x_{n}^2 + \sum_{j=1}^N\sum_{i \neq j}^{N} x_{i}x_{j} \right] \\
&= \frac{1}{N^2} \left[ \sum_{n=1}^N \mathbb{E}[x_{n}^2] + \sum_{j=1}^N\sum_{i \neq j}^{N} \mathbb{E}[x_{i}x_{j}] \right] \\
&= \frac{1}{N^2} \left( N(\mu^2 + \sigma^2) + \sum_{j=1}^N\sum_{i\neq j}^{N} \mu^2 \right)
\end{aligned}
$$

Ở đoạn cuối, ta thấy như sau:

$$
\begin{aligned}
\sum_{j=1}^N\sum_{i \neq j}^{N} \mu^2 &= (N-1)\mu^2 + ... + (N-1)\mu^2 \hspace{7pt} \text{($N$ lần)} \\
&= N(N-1)\mu^2 \\
\end{aligned}
$$

Thay ngược vào phương trình của $\mathbb{E}[\mu_{ML}^2]$ ta được:

$$
\begin{aligned}
\mathbb{E}[\mu_{ML}^2] &= \frac{1}{N^2} \left( N(\mu^2 + \sigma^2) + N(N-1)\mu^2 \right) \\
&= \mu^2 + \frac{\sigma^2}{N} = \mathbb{E}[x_{n}\mu_{ML}]
\end{aligned}
$$

Sau khi đã có cả 3, ta chứng minh được, mình đi ngủ đây, dài vãi 💀.

$$
\begin{aligned}
\mathbb{E}[\sigma^2_{ML}] &= \frac{1}{N} \sum_{n=1}^N \mathbb{E}[x_{n}^2] -\mathbb{E}[x_{n}\mu_{ML}] \\
&= \frac{1}{N} \sum_{n=1}^N \left( \sigma^2 + \mu^2 - \mu^2 - \frac{\sigma^2}{N} \right) \\
&= \frac{1}{N} \sum_{n=1}^N \left( \frac{N-1}{N} \sigma^2 \right) \\
&= \frac{(N-1)}{N} \sigma^2
\end{aligned}
$$

Sau quả tour de force chứng minh phía trên, có thể thấy $\sigma^2_{ML}$ không được như kì vọng lắm khi nó bị lệch đi một giá trị $(N-1)/N$, ta có thể gọi đây là *bias* khi mà cố gắng xấp xỉ cho những dữ liệu mà ta chưa thấy bằng một lượng hữu hạn dữ liệu mà ta có. Vậy ta muốn loại bỏ bias này, vậy thử nhân kì vọng với $N/(N-1)$ xem sao:

$$
\begin{aligned}
\frac{N}{N-1}\mathbb{E}[\sigma^2_{ML}] &= \sigma^2  \\
\mathbb{E}\left[\frac{N}{N-1} \frac{1}{N} \sum_{n=1}^N (x_n - \mu_{ML})^2\right]&= \sigma^2 \\
\mathbb{E}\left[\frac{1}{N-1} \sum_{n=1}^N (x_n - \mu_{ML})^2\right]&= \sigma^2
\end{aligned}
$$

Vậy để tối ưu như kì vọng, ta phải chia cho $N-1$ thay vì $N$ ở phương sai mẫu.

{% include figure.liquid class="img-fluid" caption="Reaction của mình" path="https://preview.redd.it/man-im-dead-v0-ymr5u3c0bjsa1.jpg?auto=webp&s=364c87d710ec0cda25a8e23fcbf1dbd692d0a597" %}