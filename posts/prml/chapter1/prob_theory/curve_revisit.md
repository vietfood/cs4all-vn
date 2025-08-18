---
layout: distill
permalink: /prml/chapter1/prob_theory/curve_revisit
title: "Curve Fitting Revisited"
subtitle: "PRML Chapter 1.2.5"
date: 2025-08-01

future: true
htmlwidgets: true
hidden: false

giscus_comments: true

bibliography: main.bib

previous_section: true
next_section: true

previous_section_url: "/cs4all-vn/prml/chapter1/prob_theory/normal"
previous_section_name: "Gaussian Distribution"

authors:
  - name: Lê Nguyễn
    url: "https://lenguyen.vercel.app"

toc:
  - name: Lý thuyết
  - name: Chứng minh
---

## Lý thuyết

Để có thể biểu diễn được **sự không chắc chắn** (uncertainty) của biến cần dự đoán $y$ (xem như một biến ngẫu nhiên), ta xem: với mỗi giá trị $x$, giá trị $y$ tương ứng sẽ có phân phối là phân phối Gaussian với trung bình là $f(x, \mathbf{w})$ và độ chính xác $\beta$.

$$
p(y \mid x, \mathbf{w}, \beta) = \mathcal{N}(y \mid f(x, \mathbf{w}), \beta^{-1})
$$

<p markdown=1 class="takeaway">
Giả sử ta muốn xấp xỉ $y$ với đường cong hồi quy $f(x, \mathbf{w})$ (như ở phần [Polynominal Curve Fitting](/cs4all-vn/prml/chapter1/polynomial_curve)) thế nhưng việc xấp xỉ sẽ bị lệch đi bởi giá trị error $\epsilon \sim \mathcal{N}(0, \beta^{-1})$, khi đó:

\\[
y = f(x, \mathbf{w}) + \epsilon
\\]

Ta xem giá trị $\epsilon$ này có phân phối chuẩn với kì vọng là $0$ và phương sai là $\beta^{-1}$ khi đó $\epsilon ~ \mathcal{N}(0, \beta^{-1})$. Ngoài ra, ta biết rằng, nếu $\mathbf{X} \sim \mathcal{N}(\mu, \sigma^2)$ thì $\mathbf{X} + \alpha \sim \mathcal{N}(\mu + \alpha, \sigma^2)$ với $\alpha$ là một hằng số (xem thêm ở [đây](https://math.stackexchange.com/questions/1923924/normal-variables-adding-and-multiplying-by-constant)). Nhớ rằng $f(x, \mathbf{w})$ là một giá trị cần được ước lượng do đó ta có thể xem nó như một hằng số, vì vậy:

\\[
y \sim \mathcal{N}(f(x, \mathbf{w}), \beta^{-1})
\\]
</p>

<p markdown=1 class="takeaway">
Việc chọn độ chính xác $\beta^{-1}$ thay cho phương sai $\sigma^2$ sẽ có lợi ích như này.

\\[
\begin{aligned}
\mathcal{N}(y \mid \mu, \beta^{-1}) &= \frac{1}{\sqrt{ 2\pi \beta^{-1} }} \exp\left( \frac{1}{2\beta^{-1}} (y - \mu)^2 \right)
= \frac{\sqrt{ \beta }}{\sqrt{ 2\pi }} \exp\left( \frac{\beta}{2}(y -\mu)^2 \right)
\end{aligned}
\\]

Có thể thấy các tham số đều của phân phối chuẩn đều nằm ở trên tử, điều này sẽ giúp cho việc tính toán dễ dàng hơn. Tuy nhiên, lý do phức tạp hơn và chính xác hơn là do **xác suất tiên nghiệm liên hợp** ([conjugate prior](https://en.wikipedia.org/wiki/Conjugate_prior)) của $\beta$.
</p>

Đặt $\{ \mathbf{X}, \mathbf{y} \}$ là tập dữ liệu huấn luyện được dùng để xác định giá trị $\mathbf{w}$ và $\beta$ không quan sát được, để xác định, ta dùng **maximum likelihood estimation** (MLE). Tập dữ liệu được giả sử lấy một cách độc lập từ cùng một phân phối, do đó:

$$
p(\mathbf{y} \mid \mathbf{X}, \mathbf{w}, \beta) = \prod_{n=1}^N \mathcal{N}(y_{n} \mid f(x_{n}, \mathbf{w}), \beta^{-1})
$$

Tiếp tục sử dụng log likelihood, ta có:

$$
\begin{aligned}
\ln p(\mathbf{y} \mid \mathbf{X}, \mathbf{w}, \beta) &= \sum_{n=1}^N \ln \mathcal{N}(y_{n} \mid f(x_{n}, \mathbf{w}), \beta^{-1}) \\
&= \sum_{n=1}^N \ln \left( \sqrt{ \frac{\beta}{2\pi} } \exp \left\{ -\frac{\beta}{2} [y_{n} - f(x_{n}, \mathbf{w})]^2 \right\} \right) \\
&= \sum_{n=1}^N -\frac{\beta}{2}[y_{n} - f(x_{n}, \mathbf{w})]^2 -  \ln \sqrt{ \frac{\beta}{2\pi} } \\
&= -\frac{\beta}{2} \sum_{n=1}^N[y_{n} - f(x_{n}, \mathbf{w})]^2 + \frac{N}{2}\ln \beta - \frac{N}{2} \ln 2\pi
\end{aligned} 
$$

<p markdown=1 class="important">
**Giá trị log likelihood**:

\\[
\ln p(\mathbf{t} \mid \mathbf{X}, \mathbf{w}, \beta) =  -\frac{\beta}{2} \sum_{n=1}^N[t_{n} - y(x_{n}, \mathbf{w})]^2 + \frac{N}{2}\ln \beta - \frac{N}{2} \ln 2\pi
\\]
</p>

**Thực hiện tối ưu Log Likelihood theo $\mathbf{w}$**:

-  Ta thấy $-\frac{N}{2} \ln 2\pi$ và $\frac{N}{2} \ln \beta$ là các giá trị không liên quan đến $\mathbf{w}$ => đạo hàm bằng $0$ do đó ta có thể bỏ đi hai giá trị đó, ngoài ra giá trị $-\frac{\beta}{2}$ là một hằng số, khi đạo hàm và lấy bằng $0$ ta không cần xét đến hằng số đó, ta có thể loại bỏ luôn đi $\beta$ và chỉ giữ lại $-\frac{1}{2}$ (mục đích để cho giống bài toán least square). Vậy mục đích của ta là tìm $\mathbf{w}$ sao cho hàm dưới đây là lớn nhất:

$$
-\frac{1}{2} \sum_{n=1}^N (y_{n} - f(x_{n}, \mathbf{w}))^2
$$

- Để cực đại hàm log thì ta có thể cực tiểu hàm log âm, vậy ta tìm $\mathbf{w}$ sao cho hàm dưới đây là nhỏ nhất:

$$
\frac{1}{2} \sum_{n=1}^N (y_{n} - f(x_{n}, \mathbf{w}))^2
$$

- Do đó bài toán MLE được đưa về thành bài toán **Least Square**.

**Thực hiện tối ưu Log Likelihood theo $\beta$**:

- Giả sử ta đã tìm được $\mathbf{w}_{\text{ML}}$ ở phía trên, thực hiện tối MLE theo $\beta$. Đầu tiên đạo hàm loglikelihood theo $\beta$, ta có:

$$
-\frac{1}{2} \sum_{n=1}^N [y_{n} - f(x_{n}, \mathbf{w}_{\text{ML}})]^2 + \frac{N}{2} \frac{1}{\beta}
$$

- Đặt đạo hàm bằng $0$, khi đó giá trị $\beta_{ML}$ sẽ là:

$$
\frac{1}{\beta_{\text{ML}}} = \frac{1}{N} \sum_{n=1}^N [y_{n} - f(x_{n}, \mathbf{w}_{\text{ML}})]^2
$$

Do đã có hai tham số $\mathbf{w}$ và $\beta$ cần thiết là $\mathbf{w}_{ML}$ và $\beta_{ML}$ thông qua maximum likelihood, ta có được phân phối:

$$
p(y \mid x, \mathbf{w}_{ML}, \beta_{ML}) = \mathcal{N}(y \mid y(x, \mathbf{w}_{ML}), \beta^{-1}_{ML})
$$

Ta gọi phân phối trên là **phân phối dự đoán** (predictive distribution). Khác với phần [Polynominal Curve Fitting](/cs4all-vn/prml/chapter1/polynomial_curve), ta không tìm một giá trị $y$ cụ thể với $x$, mà ta tìm được cả một phân phối của $y$ biết $x$. 

<p markdown=1 class="takeaway">
Vậy làm sao để tìm giá trị $y_{0}$ nếu thay thế giá trị $x_{0}$ cho cả một phân phối thay vì một giá trị, thông thường người ta sẽ lấy trung bình của phân phối và giá trị cần tìm $y_{0} = f(x_{0}, \mathbf{w}_{ML})$. Thế là quay ngược lại giống với phần [Polynominal Curve Fitting](/cs4all-vn/prml/chapter1/polynomial_curve).
</p>

Thế nhưng hướng tiếp cận của ta vẫn nằm ở frequentist khi còn dùng maximum likelihood và giá trị $f(x, \mathbf{w})$ là một giá trị ước lượng chứ không phải là một biến ngẫu nhiên. Theo bayesian, ta giả sử rằng tham số $\mathbf{w}$ là một biến ngẫu nhiên và có phân phối là:

$$
p(\mathbf{w} \mid \alpha) = \mathcal{N}(\mathbf{w} \mid \mathbf{0}, \alpha^{-1}\mathbf{I}) = \left( \frac{\alpha}{2\pi} \right)^{(M+1) / 2} \exp\left\{-\frac{\alpha}{2} \mathbf{w}^T \mathbf{w} \right\}
$$

với $\alpha$ là độ chính xác của phân phối và $M+1$ là số phần tử của $\mathbf{w}$.

<p markdown=1 class="takeaway">
Nhớ lại phân phối Gaussian cho một vector ngẫu nhiên $D$ chiều ở [Gaussian Distribution](/cs4all-vn/prml/chapter1/prob_theory/normal), ta có:

\\[
\mathcal{N}(\mathbf{x} \mid \pmb{\mu}, \pmb{\Sigma}) = \frac{1}{(2\pi)^{D/2}} \frac{1}{|\pmb{\Sigma}|^{1/2}} \exp \left\\{ -\frac{1}{2} (\mathbf{x} - \pmb{\mu})^T \pmb{\Sigma}^{-1} (\mathbf{x} - \pmb{\mu}) \right\\}
\\]

Với $\pmb{\mu}$ là vector trung bình, ở đây ta giả sử $\mathbf{w}$ có phân phối chuẩn tắc, do đó $\pmb{\mu}=\mathbf{0}$.  Còn $\pmb{\Sigma}$ là ma trận hiệp phương sai của phân phối. Ta định nghĩa độ chính xác của phân phối là $\pmb{\beta} = \pmb{\Sigma}^{-1}$ hay ${} \pmb{\beta}^{-1} = \pmb{\Sigma} {}$. Nếu chọn $\pmb{\beta} = \alpha \mathbf{I}$ với $\mathbf{I}$ là ma trận đơn vị thì ${} \pmb{\Sigma} = \pmb{\beta}^{-1} = \alpha^{-1} \mathbf{I}$ do đó $|\pmb{\Sigma}| = (\alpha^{-1})^{M+1} = \alpha^{-(M+1)}$ (bởi vì ${} \pmb{\Sigma}$ là một ma trận chéo, và định thức ma trận chéo bằng tích các phần tử trên đường chéo).

Cuối cùng thay $\mathbf{w}$ có chiều $M+1$ cho $\mathbf{x}$, ta được:

\\[
\mathcal{N}(\mathbf{w} \mid \mathbf{0}, \alpha^{-1}\mathbf{I}) 
= \frac{1}{(2\pi)^{(M+1)/2}} \cdot \frac{1}{(\alpha^{-(M+1)})^{1/2}} 
\exp\left\\{ -\frac{1}{2}\mathbf{w}^T \alpha \mathbf{I} \mathbf{w} \right\\}
\\]

\\[
= \left( \frac{\alpha}{2\pi} \right)^{(M+1)/2} 
\exp\left\\{ -\frac{\alpha}{2}\mathbf{w}^T\mathbf{w} \right\\}
\\]

</p>

Ta thấy khi thay đổi giá trị $\alpha$ thì thay đổi luôn cả phân phối của $\mathbf{w}$, do đó những giá trị như $\alpha$ được gọi là **siêu tham số** (hyperameter). Những siêu tham số này được ta đặt trước (hoặc có thể tìm luôn) trước khi khi huấn luyện mô hình dựa trên dữ liệu có được.

Sử dụng định lý Bayes, posterior của $\mathbf{w}$ tỉ lệ với tích của prior và hàm likelihood:

$$
p(\mathbf{w} \mid \mathbf{X}, \mathbf{y}, \alpha, \beta) \propto p(\mathbf{y} \mid \mathbf{X}, \mathbf{w}, \beta)p(\mathbf{w} \mid \alpha)
$$

khi ấy posterior của $\mathbf{w}$ điều kiện với dữ liệu ($\mathbf{X}, \mathbf{y}, \beta$) (chính là $p(\mathbf{w} \mid \mathcal{D})$ ở phần [Bayesian Probabilities](/cs4all-vn/prml/chapter1/prob_theory/bayes)) và siêu tham số $\alpha$ sẽ tỉ lệ với tích của hàm likelihood $p(\mathbf{y} \mid \mathbf{X}, \mathbf{w}, \beta)$ (nó chính là $p(\mathcal{D} \mid \mathbf{w})$ ở phần [Bayesian Probabilities](/cs4all-vn/prml/chapter1/prob_theory/bayes) nếu ta xem $\mathcal{D}$ gồm $\mathbf{y}$ và $\mathbf{y}$ điều kiện $\mathbf{x}, \beta$) và phân phối tiên nghiệm $p(\mathbf{w} \mid \alpha)$ (phân phối xác suất của $\mathbf{w}$ trước khi quan sát dữ liệu). 

Để tìm được giá trị $\mathbf{w}$ tối ưu posterior $p(\mathbf{w} \mid \mathbf{X}, \mathbf{t}, \alpha, \beta)$ ta cần tối ưu đồng thời cả hai hàm likelihood $p(\mathbf{t} \mid \mathbf{X}, \mathbf{w}, \beta)$ và prior $p(\mathbf{w} \mid \alpha)$. Việc tối ưu này được gọi là **MAP** hay **Maximum A Posteriori**. Tương tự như MLE, ta tối ưu log, ta có:

$$
\ln p(\mathbf{w} \mid \mathbf{X}, \mathbf{t}, \alpha, \beta) \propto \ln p(\mathbf{t} \mid \mathbf{X}, \mathbf{w}, \beta) + \ln p(\mathbf{w} \mid \alpha)
$$

Tương tự MLE, ta có:

$$
\ln p(\mathbf{t} \mid \mathbf{X}, \mathbf{w}, \beta) = -\frac{\beta}{2} \sum_{n=1}^N[t_{n} - y(x_{n}, \mathbf{w})]^2 + \frac{N}{2}\ln \beta - \frac{N}{2} \ln 2\pi
$$

Ở log prior, ta có:

$$
\ln p(\mathbf{w}, \alpha) = \frac{{M+1}}{2} \ln \frac{\alpha}{2\pi} - \frac{\alpha}{2} \mathbf{w}^T\mathbf{w}
$$

Kết hợp cả hai lại, ngoài ra bỏ đi các giá trị thừa, chỉ để lại các giá trị liên quan đến $\mathbf{w}$ (bởi vì đạo hàm cũng là $0$) nên ta có (ngoài ra thực hiện tối thiểu MAP thay vì tối ưu, do đó nhân với $-1$):

$$
\frac{\beta}{2} \sum_{n=1}^N [t_{n} - y(x_{n}, \mathbf{w})]^2 + \frac{\alpha}{2} \mathbf{w}^T \mathbf{w}
$$

Nếu nhìn kĩ thì phương trình này có dạng của bình phương nhỏ nhất kèm với phần chính quy hoá, ta có $\mathbf{w}^T \mathbf{w} = \lVert \mathbf{w} \rVert$, tiếp tục đặt $\lambda =\alpha / \beta$ và bỏ đi hằng số $\beta$, ta có:

$$
\begin{aligned}
\beta \left(\frac{1}{2} \sum_{n=1}^N (t_{n} - y(x_{n}, \mathbf{w}))^2 + \frac{\lambda}{2} ||\mathbf{w}|| \right) \\
\implies 
\frac{1}{2} \sum_{n=1}^N (t_{n} - y(x_{n}, \mathbf{w}))^2 + \frac{\lambda}{2} ||\mathbf{w}||
\end{aligned}
$$