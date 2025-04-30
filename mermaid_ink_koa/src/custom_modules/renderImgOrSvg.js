const createDebug = require('debug');
const openMermaidPage = require('./openMermaidPage');
const renderSVG = require('./renderSVG');

const debug = createDebug('app:renderImgOrSvg');

function bgColorFromContext(ctx) {
  const bgColor = ctx.query.bgColor?.trim();
  if (bgColor && /^(![a-z]+)|([\da-f]{3,8})$/i.test(bgColor)) {
    // either a named color if prefiexed with "!" (e.g. "!red"),
    // or an hexadecimal without the "#" (444, EFEFEF, FF000055)
    return bgColor.startsWith('!') ? bgColor.substring(1) : `#${bgColor}`;
  }
}

function sizeFromContext(ctx) {
  let width = null;
  let height = null;

  if (ctx.query.width) {
    const parsedWidth = parseInt(ctx.query.width);
    if (!parsedWidth) {
      ctx.throw(400, 'invalid width value');
    }
    width = parsedWidth;
  }

  if (ctx.query.height) {
    const parsedHeight = parseInt(ctx.query.height);
    if (!parsedHeight) {
      ctx.throw(400, 'invalid height value');
    }
    height = parsedHeight;
  }

  let scale = 1;
  if (ctx.query.scale) {
    if (!width && !height) {
      ctx.throw(
        400,
        'scale can only be set when either width or height is set'
      );
    }
    const parsedScale = parseFloat(ctx.query.scale);
    if (!parsedScale || parsedScale < 1 || parsedScale > 3) {
      ctx.throw(400, 'invalid scale value - must be a number between 1 and 3');
    }
    scale = parsedScale;
  }

  if (width) {
    width *= scale;

    if (width <= 0 || (ctx.state.maxWidth && width > ctx.state.maxWidth)) {
      ctx.throw(400, `the scaled width must be between 0 and ${ctx.maxWidth}`);
    }
  }

  if (height) {
    height *= scale;

    if (height <= 0 || (ctx.state.maxHeight && height > ctx.state.maxHeight)) {
      ctx.throw(
        400,
        `the scaled height must be between 0 and ${ctx.maxHeight}`
      );
    }
  }

  return { width, height };
}

function themeFromContext(ctx) {
  return ['default', 'neutral', 'dark', 'forest'].includes(
    ctx.query.theme?.toLowerCase()
  )
    ? ctx.query.theme?.toLowerCase()
    : null;
}

module.exports = (render) => async (ctx, encodedCode, _next) => {
  debug(`start to render, code: ${encodedCode}`);

  let page;
  try {
    page = await openMermaidPage(ctx);
    const bgColor = bgColorFromContext(ctx);
    const size = sizeFromContext(ctx);
    const theme = themeFromContext(ctx);
    debug('loaded local mermaid page');

    try {
      await renderSVG({ page, encodedCode, bgColor, size, theme });
      debug('rendered SVG in DOM');
    } catch (e) {
      debug('mermaid failed to render SVG: %o', e);
      ctx.throw(400, e);
    }
    await render(ctx, page, size);
  } catch (e) {
    // here don't throw 500 if exception has already been thrown inside try-catch
    if (!ctx.headerSent) {
      debug('*** caught exception ***');
      debug(e);

      ctx.throw(500, e);
    }
  } finally {
    if (page) await page.close();
  }
};
