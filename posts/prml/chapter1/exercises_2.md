---
layout: distill
permalink: /prml/chapter1/exercises_2
title: "Exercises (Part II)"
subtitle: "PRML Chapter 1 Exercises"
date: 2025-04-24
future: true
htmlwidgets: true
hidden: false
giscus_comments: true

authors:
  - name: Lê Nguyễn
    url: "https://lenguyen.vercel.app"

toc:
  - name: Bài 1-11
  - name: Bài 1-12
  - name: Bài 1-13
---

## Bài 1-11

Ta có:

$$
\begin{aligned}
\ln \mathcal{L}(\mu, \sigma^2 \mid \mathcal{D}) &= \ln \prod_{i=1}^N p(x_{i} \mid \mu, \sigma^2) \\
&= \sum_{i=1}^N \ln p(x_{i} \mid \mu, \sigma^2) \\
&= \sum_{i=1}^N \ln \frac{1}{(2\pi\sigma^2)^{1/2}} \exp \left\{ -\frac{1}{2\sigma^2} (x_{i} - \mu)^2 \right\} \\
&= \sum_{i=1}^N \left[\ln (2\pi\sigma^2)^{-1/2} -\frac{1}{2\sigma^2} (x_{i} - \mu)^2 \right] \\
&= \sum_{i=1}^N \left[- \frac{1}{2}\ln 2\pi -\frac{1}{2}\ln \sigma^2 - \frac{1}{2\sigma^2} (x_{i} - \mu)^2 \right] \\
&= \left[-\frac{1}{2\sigma^2} \sum_{i=1}^N (x_{i} - \mu)^2 \right] - \frac{N}{2} \ln 2\pi - \frac{N}{2}\ln \sigma^2
\end{aligned}
$$

Để tìm giá trị cực đại của một hàm, ta đạo hàm sau đó lấy bằng $0$. Ta biết rằng $\ln$ là một hàm đồng biến trên $\mathbb{R}$ do đó giá trị tại dạo hàm bằng $0$ cũng chính là cực đại. Ta sẽ viết gọn $\ln \mathcal{L}(\mu, \sigma^2 \mid \mathcal{D})$ thành $\mathcal{L}$.

Xét cực đại bằng $\mu$, ta có:

$$
\frac{\partial\mathcal{L}}{\partial\mu} = -\frac{1}{2\sigma^2} \sum_{n=1}^N -2x_{n} + 2\mu 
$$

Khi đó, giá trị cần tìm là:

$$
\begin{aligned}
-\frac{1}{2\sigma^2} \sum_{n=1}^N -2x_{n} + 2\mu &= 0 \\
\implies \sum_{n=1}^N -2x_{n} + 2\mu &= 0 \\
\Leftrightarrow 2\sum_{n=1}^N -x_{n} + 2N\mu &= 0 \\
\Leftrightarrow \mu = \frac{1}{N} \sum_{n=1}^N x_{n}
\end{aligned}
$$

Xét cực đại bằng $\sigma^2$, ta có:

$$
\frac{\partial \mathcal{L}}{\partial \sigma^2} = \frac{1}{2\sigma^4} \sum_{n=1}^N (x_{n} - \mu)^2 - \frac{N}{2} \frac{1}{\sigma^2}
$$

Khi đó, giá trị cần tìm là:

$$
\begin{aligned}
\frac{1}{2\sigma^4} \sum_{n=1}^N (x_{n} - \mu)^2 - \frac{N}{2} \frac{1}{\sigma^2} = 0 \\
\implies \frac{1}{\sigma^2} \sum_{n=1}^N (x_{n} - \mu)^2 - N = 0 \\
\Leftrightarrow \sigma^2 = \frac{1}{N} \sum_{n=1}^N (x_{n} - \mu)^2
\end{aligned}
$$

## Bài 1-12

Ở $\mathbb{E}[x_{n}x_{m}]$ nếu $n = m$ thì ta có $\mathbb{E}[x_{n}x_{m}] = \mathbb{E}[x_{n}^2] = \sigma^2 + \mu^2$. Vậy:

$$
\mathbb{E}[x_{n}x_{m}] = \sigma^2 + \mu^2 \hspace{5pt} \text{(nếu $m = n$)}
$$

Còn nếu $n \neq m$ (ta hãy nhớ hai biến ngẫu nhiên độc lập thì kì vọng tích bằng tích kì vọng) thì:

$$
\begin{align*}
\mathbb{E}[x_{n}x_{m}] &= \mathbb{E}[x_{n}] \mathbb{E}[x_{m}] \\
&= \mu^2 \hspace{5pt} \text{(nếu $m \neq n$)}
\end{align*}
$$

Đặt $I_{nm} = 1$ nếu $m = n$ và $I_{mn} = 0$ nếu $n \neq m$, ta được:

$$
\mathbb{E}[x_{n}x_{m}] = \mu^2 + I_{mn}\sigma^2
$$

## Bài 1-13

<p class="takeaway" markdown=1>
Phương trình 1.56:
\\[
\sigma_{ML}^2 = \frac{1}{N} \sum_{n=1}^N (x_{n} - \mu_{ML}^2) 
\\]
</p>

Nếu thay trung bình mẫu $\mu_{ML}^2$ thành trung bình thật sự của phân phối là $\mu$, ta có:

$$
\sigma^2_{ML} = \frac{1}{N} \sum_{n=1}^N (x_{n} - \mu^2) 
$$

Lúc này ta có (trung bình thật sự $\mu$ là một hằng số):

$$
\begin{align*}
\mathbb{E}[\sigma^2_{ML}] &= \frac{1}{N} \sum_{n=1}^N \mathbb{E}[x_{n}^2 - 2x_{n}\mu + \mu^2] \\ 
&= \frac{1}{N} \sum_{n=1}^N (\mathbb{E}[x_{n}^2] - 2\mathbb{E}[x_{n}\mu] + \mathbb{E}[\mu^2]) \\
&= \frac{1}{N} \sum_{n=1}^N (\mathbb{E}[x_{n}^2] - 2\mu\mathbb{E}[x_{n}] + \mu^2) \\
&= \frac{1}{N} \sum_{n=1}^N (\sigma^2 + \mu^2 - 2\mu^2 + \mu^2) \\
&= \frac{1}{N} \sum_{n=1}^N \sigma^2 \\
&= \sigma^2
\end{align*}
$$

Vậy khi phương sai mẫu $\sigma^2_{ML}$ được tính bằng trung bình thật sự $\mu$ thì giá trị ước lượng này đúng với phương sai thật sự $\sigma^2$.