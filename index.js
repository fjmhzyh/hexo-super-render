const MarkdownIt = require('markdown-it');
const Prism = require('prismjs');
const prismLoadLanguages = require('prismjs/components/');

// https://github.com/PrismJS/prism/issues/2145
const prismComponents = require('prismjs/components');
const prismSupportedLanguages = Object.keys(prismComponents.languages);


const md = new MarkdownIt({
  linkify: true,
  highlight: function (str, lang) {
    var result = superHighlight(str, lang);
    return result;
  }
})

md.use(require('markdown-it-anchor'),{
  slugify,
  permalink: true,
  permalinkBefore: true,
  permalinkSymbol: '#'
}); 
md.use(require("markdown-it-table-of-contents"), {
  slugify
});
md.use(require("markdown-it-emoji"));
md.use(require('markdown-it-sub'));
md.use(require('markdown-it-sup'));

var title = '';

hexo.extend.filter.register('before_post_render', function(data){
  title = data.title;
  var result = md.render(data.content);
  // console.log('data.content', md.render(data.content))
  data.html = result;
  // if(data.title == 'My New Post'){
  //   console.log('data.content', data.content)
  //   console.log('data.raw', data.raw)
  // }
  return data;
},1);


function getLangCodeFromExtension (extension) {

  const extensionMap = {
    vue: 'markup',
    html: 'markup',
    md: 'markdown',
    rb: 'ruby',
    ts: 'typescript',
    py: 'python',
    sh: 'bash',
    yml: 'yaml',
    styl: 'stylus',
    kt: 'kotlin',
    rs: 'rust'
  }

  return extensionMap[extension] || extension
}


function superHighlight (str, lang) {

  if (!lang) {
    return wrap(str, 'text')
  }
  lang = lang.toLowerCase()
  const rawLang = lang

  lang = getLangCodeFromExtension(lang)

  if (!Prism.languages[lang] && prismSupportedLanguages.includes(lang)) {
    try {
      prismLoadLanguages(lang)
    } catch (e) {
      console.log(`[hexo-super-prism] Syntax highlight for language "${lang}" is not supported.`)
    }
  };

  if (Prism.languages[lang]) {
    const code = Prism.highlight(str, Prism.languages[lang], lang)

    // if(title == 'My New Post'){
    //   console.log('last', code)
    // }

    return wrap(code, rawLang)
  }
  return wrap(str, 'text')
}


function wrap (code, lang) {

  if (lang === 'text') {
    // code = escapeHtml(code)
  }
  // return code;
  return `<div class="language-${lang} extra-class"><pre v-pre class="language-${lang}"><code>${code}</code></pre></div>`
  // return `<pre v-pre class="language-${lang}"><code>${code}</code></pre>`
}



const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’–—<>,.?/]+/g;
const rCombining = /[\u0300-\u036F]/g;

function slugify(str) {
// Split accented characters into components
  return str.normalize('NFKD')
    // Remove accents
    .replace(rCombining, '')
    // Remove control characters
    .replace(rControl, '')
    // Replace special characters
    .replace(rSpecial, '-')
    // Remove continuous separators
    .replace(/\-{2,}/g, '-')
    // Remove prefixing and trailing separators
    .replace(/^\-+|\-+$/g, '')
    // ensure it doesn't start with a number (#121)
    .replace(/^(\d)/, '_$1')
    // lowercase
    .toLowerCase();
};
