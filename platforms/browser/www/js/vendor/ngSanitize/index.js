!function(root, factory) {

  // Set up ngSanitize appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global ngSanitize.
      root.ngSanitize = factory(root, exports);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    factory(root, exports);

  // Finally, as a browser global.
  } else {
    root.ngSanitize = factory(root, {});
  }

}(this, function(root, ngSanitize) {
  'use strict';

  ngSanitize.aHrefSanitizationWhitelist  = aHrefSanitizationWhitelist;
  ngSanitize.imgSrcSanitizationWhitelist = imgSrcSanitizationWhitelist;
  ngSanitize.ngSanitize = ngSanitize;

  var _aHrefSanitizationWhitelist = /^\s*(https?|ftp|mailto|tel|file):/;
  var _imgSrcSanitizationWhitelist = /^\s*(https?|ftp|file):|data:image\//;
  var toString = Object.prototype.toString;
  var slice = Array.prototype.slice;
  var urlParsingNode = document.createElement('a');
  var msie = int((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
  if (isNaN(msie)) {
    msie = int((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
  }

  function imgSrcSanitizationWhitelist(regexp) {
    if (isDefined(regexp)) {
      _imgSrcSanitizationWhitelist = regexp;
      return this;
    }
    return _imgSrcSanitizationWhitelist;
  }
  function aHrefSanitizationWhitelist(regexp) {
    if (isDefined(regexp)) {
      _aHrefSanitizationWhitelist = regexp;
      return this;
    }
    return _aHrefSanitizationWhitelist;
  }
  function ngSanitize(html) {
    var buf = [];
    htmlParser(html, htmlSanitizeWriter(buf, function(uri, isImage) {
      return !/^unsafe/.test(sanitizeUri(uri, isImage));
    }));
    return buf.join('');
  }

  function noop() {}
  function isString(value){ return typeof value === 'string'; }
  function lowercase(string){ return isString(string) ? string.toLowerCase() : string; }
  function isDefined(value){ return typeof value !== 'undefined'; }
  function int(str) { return parseInt(str, 10); }
  function isFunction(value){ return typeof value === 'function'; }
  function isWindow(obj) { return obj && obj.document && obj.location && obj.alert && obj.setInterval; }
  function isArray(value) { return toString.call(value) === '[object Array]'; }
  function sliceArgs(args, startIndex) { return slice.call(args, startIndex || 0); }
  function isArrayLike(obj) {
    if (obj === null || isWindow(obj)) {
      return false;
    }
    var length = obj.length;
    if (obj.nodeType === 1 && length) {
      return true;
    }
    return isString(obj) || isArray(obj) || length === 0 ||
           typeof length === 'number' && length > 0 && (length - 1) in obj;
  }
  function bind(self, fn) {
    var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];
    if (isFunction(fn) && !(fn instanceof RegExp)) {
      return curryArgs.length ?
          function() {
            return arguments.length ?
                fn.apply(self, curryArgs.concat(slice.call(arguments, 0)))
              : fn.apply(self, curryArgs);
          }
        : function() {
            return arguments.length ?
                fn.apply(self, arguments)
              : fn.call(self);
          };
    } else {
      // in IE, native methods are not functions so they cannot be bound (note: they don't need to be)
      return fn;
    }
  }
  function forEach(obj, iterator, context) {
    var key;
    if (obj) {
      if (isFunction(obj)){
        for (key in obj) {
          // Need to check if hasOwnProperty exists,
          // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
          if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
            iterator.call(context, obj[key], key);
          }
        }
      } else if (obj.forEach && obj.forEach !== forEach) {
        obj.forEach(iterator, context);
      } else if (isArrayLike(obj)) {
        for (key = 0; key < obj.length; key++)
          iterator.call(context, obj[key], key);
      } else {
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key);
          }
        }
      }
    }
    return obj;
  }
  function extend(dst) {
    forEach(arguments, function(obj){
      if (obj !== dst) {
        forEach(obj, function(value, key){
          dst[key] = value;
        });
      }
    });
    return dst;
  }
  function makeMap(str) {
    var obj = {}, items = str.split(','), i;
    for (i = 0; i < items.length; i++) obj[items[i]] = true;
    return obj;
  }

  function urlResolve(url, base) {
    var href = url;

    if (msie) {
      // Normalize before parse.  Refer Implementation Notes on why this is
      // done in two steps on IE.
      urlParsingNode.setAttribute('href', href);
      href = urlParsingNode.href;
    }

    urlParsingNode.setAttribute('href', href);

    // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
    return {
      href: urlParsingNode.href,
      protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
      host: urlParsingNode.host,
      search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
      hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
      hostname: urlParsingNode.hostname,
      port: urlParsingNode.port,
      pathname: (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname : '/' + urlParsingNode.pathname
    };
  }

  function sanitizeUri(uri, isImage) {
    var regex = isImage ? _imgSrcSanitizationWhitelist : _aHrefSanitizationWhitelist;
    var normalizedVal;
    // NOTE: urlResolve() doesn't support IE < 8 so we don't sanitize for that case.
    if (!msie || msie >= 8 ) {
      normalizedVal = urlResolve(uri).href;
      if (normalizedVal !== '' && !normalizedVal.match(regex)) {
        return 'unsafe:'+normalizedVal;
      }
    }
    return uri;
  }


  function sanitizeText(chars) {
    var buf = [];
    var writer = htmlSanitizeWriter(buf, noop);
    writer.chars(chars);
    return buf.join('');
  }


  // Regular Expressions for parsing tags and attributes
  var START_TAG_REGEXP =
         /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/,
    END_TAG_REGEXP = /^<\s*\/\s*([\w:-]+)[^>]*>/,
    ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g,
    BEGIN_TAG_REGEXP = /^</,
    BEGING_END_TAGE_REGEXP = /^<\s*\//,
    COMMENT_REGEXP = /<!--(.*?)-->/g,
    DOCTYPE_REGEXP = /<!DOCTYPE([^>]*?)>/i,
    CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g,
    // Match everything outside of normal chars and " (quote character)
    NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g;


  // Good source of info about elements and attributes
  // http://dev.w3.org/html5/spec/Overview.html#semantics
  // http://simon.html5.org/html-elements

  // Safe Void Elements - HTML5
  // http://dev.w3.org/html5/spec/Overview.html#void-elements
  var voidElements = makeMap('area,br,col,hr,img,wbr');

  // Elements that you can, intentionally, leave open (and which close themselves)
  // http://dev.w3.org/html5/spec/Overview.html#optional-tags
  var optionalEndTagBlockElements = makeMap('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr'),
      optionalEndTagInlineElements = makeMap('rp,rt'),
      optionalEndTagElements = extend({},
                                      optionalEndTagInlineElements,
                                      optionalEndTagBlockElements);

  // Safe Block Elements - HTML5
  var blockElements = extend({}, optionalEndTagBlockElements, makeMap('address,article,' +
          'aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,' +
          'h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul'));

  // Inline Elements - HTML5
  var inlineElements = extend({}, optionalEndTagInlineElements, makeMap('a,abbr,acronym,b,' +
          'bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,' +
          'samp,small,span,strike,strong,sub,sup,time,tt,u,var'));


  // Special Elements (can contain anything)
  var specialElements = makeMap('script,style');

  var validElements = extend({},
                             voidElements,
                             blockElements,
                             inlineElements,
                             optionalEndTagElements);

  //Attributes that have href and hence need to be sanitized
  var uriAttrs = makeMap('background,cite,href,longdesc,src,usemap');
  var validAttrs = extend({}, uriAttrs, makeMap(
      'abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,'+
      'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,'+
      'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,'+
      'scope,scrolling,shape,size,span,start,summary,target,title,type,'+
      'valign,value,vspace,width'));

  /**
   * @example
   * htmlParser(htmlString, {
   *     start: function(tag, attrs, unary) {},
   *     end: function(tag) {},
   *     chars: function(text) {},
   *     comment: function(text) {}
   * });
   *
   * @param {string} html string
   * @param {object} handler
   */
  function htmlParser( html, handler ) {
    var index, chars, match, stack = [], last = html;
    stack.last = function() { return stack[ stack.length - 1 ]; };

    while ( html ) {
      chars = true;

      // Make sure we're not in a script or style element
      if ( !stack.last() || !specialElements[ stack.last() ] ) {

        // Comment
        if ( html.indexOf('<!--') === 0 ) {
          // comments containing -- are not allowed unless they terminate the comment
          index = html.indexOf('--', 4);

          if ( index >= 0 && html.lastIndexOf('-->', index) === index) {
            if (handler.comment) handler.comment( html.substring( 4, index ) );
            html = html.substring( index + 3 );
            chars = false;
          }
        // DOCTYPE
        } else if ( DOCTYPE_REGEXP.test(html) ) {
          match = html.match( DOCTYPE_REGEXP );

          if ( match ) {
            html = html.replace( match[0], '');
            chars = false;
          }
        // end tag
        } else if ( BEGING_END_TAGE_REGEXP.test(html) ) {
          match = html.match( END_TAG_REGEXP );

          if ( match ) {
            html = html.substring( match[0].length );
            match[0].replace( END_TAG_REGEXP, parseEndTag );
            chars = false;
          }

        // start tag
        } else if ( BEGIN_TAG_REGEXP.test(html) ) {
          match = html.match( START_TAG_REGEXP );

          if ( match ) {
            html = html.substring( match[0].length );
            match[0].replace( START_TAG_REGEXP, parseStartTag );
            chars = false;
          }
        }

        if ( chars ) {
          index = html.indexOf('<');

          var text = index < 0 ? html : html.substring( 0, index );
          html = index < 0 ? '' : html.substring( index );

          if (handler.chars) { handler.chars( decodeEntities(text) ); }
        }

      } else {
        html = html.replace(new RegExp('(.*)<\\s*\\/\\s*' + stack.last() + '[^>]*>', 'i'),
          function(all, text){
            text = text.replace(COMMENT_REGEXP, '$1').replace(CDATA_REGEXP, '$1');

            if (handler.chars) { handler.chars( decodeEntities(text) ); }

            return '';
        });

        parseEndTag( '', stack.last() );
      }

      if ( html == last ) {
        throw new Error('badparse', 'The sanitizer was unable to parse the following block ' +
                                          'of html: {0}', html);
      }
      last = html;
    }

    // Clean up any remaining tags
    parseEndTag();

    function parseStartTag( tag, tagName, rest, unary ) {
      tagName = lowercase(tagName);
      if ( blockElements[ tagName ] ) {
        while ( stack.last() && inlineElements[ stack.last() ] ) {
          parseEndTag( '', stack.last() );
        }
      }

      if ( optionalEndTagElements[ tagName ] && stack.last() == tagName ) {
        parseEndTag( '', tagName );
      }

      unary = voidElements[ tagName ] || !!unary;

      if ( !unary )
        stack.push( tagName );

      var attrs = {};

      rest.replace(ATTR_REGEXP,
        function(match, name, doubleQuotedValue, singleQuotedValue, unquotedValue) {
          var value = doubleQuotedValue || singleQuotedValue || unquotedValue || '';

          attrs[name] = decodeEntities(value);
      });
      if (handler.start) { handler.start( tagName, attrs, unary ); }
    }

    function parseEndTag( tag, tagName ) {
      var pos = 0, i;
      tagName = lowercase(tagName);
      if ( tagName )
        // Find the closest opened tag of the same type
        for ( pos = stack.length - 1; pos >= 0; pos-- )
          if ( stack[ pos ] == tagName )
            break;

      if ( pos >= 0 ) {
        // Close all the open elements, up the stack
        for ( i = stack.length - 1; i >= pos; i-- )
          if (handler.end) { handler.end( stack[ i ] ); }

        // Remove the open elements from the stack
        stack.length = pos;
      }
    }
  }

  var hiddenPre = document.createElement('pre');
  var spaceRe = /^(\s*)([\s\S]*?)(\s*)$/;
  /**
   * decodes all entities into regular string
   * @param value
   * @returns {string} A string with decoded entities.
   */
  function decodeEntities(value) {
    if (!value) { return ''; }

    // Note: IE8 does not preserve spaces at the start/end of innerHTML
    // so we must capture them and reattach them afterward
    var parts = spaceRe.exec(value);
    var spaceBefore = parts[1];
    var spaceAfter = parts[3];
    var content = parts[2];
    if (content) {
      hiddenPre.innerHTML=content.replace(/</g,'&lt;');
      // innerText depends on styling as it doesn't display hidden elements.
      // Therefore, it's better to use textContent not to cause unnecessary
      // reflows. However, IE<9 don't support textContent so the innerText
      // fallback is necessary.
      content = 'textContent' in hiddenPre ?
        hiddenPre.textContent : hiddenPre.innerText;
    }
    return spaceBefore + content + spaceAfter;
  }

  /**
   * Escapes all potentially dangerous characters, so that the
   * resulting string can be safely inserted into attribute or
   * element text.
   * @param value
   * @returns {string} escaped text
   */
  function encodeEntities(value) {
    return value.
      replace(/&/g, '&amp;').
      replace(NON_ALPHANUMERIC_REGEXP, function(value){
        return '&#' + value.charCodeAt(0) + ';';
      }).
      replace(/</g, '&lt;').
      replace(/>/g, '&gt;');
  }

  /**
   * create an HTML/XML writer which writes to buffer
   * @param {Array} buf use buf.jain('') to get out sanitized html string
   * @returns {object} in the form of {
   *     start: function(tag, attrs, unary) {},
   *     end: function(tag) {},
   *     chars: function(text) {},
   *     comment: function(text) {}
   * }
   */
  function htmlSanitizeWriter(buf, uriValidator){
    var ignore = false;
    var out = bind(buf, buf.push);
    return {
      start: function(tag, attrs, unary){
        tag = lowercase(tag);
        if (!ignore && specialElements[tag]) {
          ignore = tag;
        }
        if (!ignore && validElements[tag] === true) {
          out('<');
          out(tag);
          forEach(attrs, function(value, key){
            var lkey = lowercase(key);
            var isImage = (tag === 'img' && lkey === 'src') || (lkey === 'background');
            if (validAttrs[lkey] === true &&
              (uriAttrs[lkey] !== true || uriValidator(value, isImage))) {
              out(' ');
              out(key);
              out('="');
              out(encodeEntities(value));
              out('"');
            }
          });
          out(unary ? '/>' : '>');
        }
      },
      end: function(tag){
          tag = lowercase(tag);
          if (!ignore && validElements[tag] === true) {
            out('</');
            out(tag);
            out('>');
          }
          if (tag == ignore) {
            ignore = false;
          }
        },
      chars: function(chars){
          if (!ignore) {
            out(encodeEntities(chars));
          }
        }
    };
  }

  return ngSanitize;
});
