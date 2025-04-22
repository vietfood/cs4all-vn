window.MathJax = {
  tex: {
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
    processEscapes: true,      // use \$ to produce a literal dollar sign
    processEnvironments: true, // process \begin{xxx}...\end{xxx} outside math mode
    processRefs: true,         // process \ref{...} outside of math mode
    digits: /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/,
    // pattern for recognizing numbers
    tags: 'ams',              // or 'ams' or 'all'
    tagSide: 'right',          // side for \tag macros
    tagIndent: '0.8em',        // amount to indent tags
    useLabelIds: true,         // use label name rather than tag for ids
    maxMacros: 10000,          // maximum number of macro substitutions per expression
    maxBuffer: 5 * 1024,       // maximum size for the internal TeX string (5K)
    macros: {
      R: '\\mathbb{R}',
      e: "\\epsilon",
      xti: "x^{(i)}",
      yti: "y^{(i)}",
      bfy: "{\\bf y}",
      bfx: "{\\bf x}",
      bfg: "{\\bf g}",
      bfbeta: "{\\bf \\beta}",
      tp: "\\tilde p",
      pt: "p_\\theta",
      E: "{\\mathbb{E}}",
      Ind: "{\\mathbb{I}}",
      KL: "{\\mathbb{KL}}",
      Re: "{\\mathbb{R}}",
      Dc: "{\\mathcal{D}}",
      Tc: "{\\mathcal{T}}",
      Xc: "{\\mathcal{X}}",
      note: ["\\textcolor{blue}{[NOTE: #1]}", 1]
    }
  },
};