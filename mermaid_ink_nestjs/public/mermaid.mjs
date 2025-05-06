import mermaid from '/assets/mermaid/mermaid.esm.min.mjs';

function isUnknownDiagramError(code) {
  return code.includes('UnknownDiagramError');
}

function setBgColor(svgElement, bgColor) {
  document.body.style.backgroundColor = bgColor;
  svgElement.style.backgroundColor = bgColor;
}

function setSize(svgElement, size) {
  svgElement.style.maxWidth = '100%';
  svgElement.removeAttribute('width');
  size.width && svgElement.setAttribute('width', `${size.width}px`);
  size.height && svgElement.setAttribute('height', `${size.height}px`);
}

async function render(definition, config, bgColor, size) {
  await Promise.all(Array.from(document.fonts, (font) => font.load()));
  try {
    mermaid.initialize({
      ...config,
      startOnLoad: false,
      securityLevel: 'loose',
    });
    const { container } = window;
    const { svg: svgHtml, bindFunctions } = await mermaid.render(
      'mermaid-svg',
      definition
    );
    container.innerHTML = svgHtml;
    bindFunctions?.(container);
    const svgElement = container.querySelector('svg');
    if (bgColor) setBgColor(svgElement, bgColor);
    if (size && (size.width || size.height)) setSize(svgElement, size);
  } catch (error) {
    console.error('Failed to render', error);
    if (isUnknownDiagramError(error.toString())) {
      throw new Error('Unknown diagram error');
    }
    throw error.message;
  }
}

window.App = { render };