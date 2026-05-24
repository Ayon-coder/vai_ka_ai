const ALLOWED_TAGS = new Set([
  'a','b','strong','i','em','u','s','strike','br','p','ul','ol','li','blockquote',
  'code','pre','kbd','span','div','h1','h2','h3','h4','h5','h6','hr','table',
  'thead','tbody','tr','th','td','img'
]);

const ALLOWED_ATTRS = new Set(['href','title','target','rel','alt','src','class']);

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;

function sanitizeNode(node) {
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === 1) {
      const tag = child.tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        const frag = document.createDocumentFragment();
        while (child.firstChild) frag.appendChild(child.firstChild);
        child.replaceWith(frag);
        continue;
      }
      for (const attr of Array.from(child.attributes)) {
        const name = attr.name.toLowerCase();
        if (!ALLOWED_ATTRS.has(name)) {
          child.removeAttribute(attr.name);
          continue;
        }
        if ((name === 'href' || name === 'src') && !SAFE_URL.test(attr.value.trim())) {
          child.removeAttribute(attr.name);
        }
      }
      if (tag === 'a') {
        child.setAttribute('target', '_blank');
        child.setAttribute('rel', 'noopener noreferrer');
      }
      sanitizeNode(child);
    } else if (child.nodeType !== 3) {
      child.remove();
    }
  }
}

export function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstChild;
  sanitizeNode(root);
  return root.innerHTML;
}
