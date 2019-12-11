// htmlParse
/**
 * 概要：
 * 1.将模板字符串解析为AST结构
 * 2.解析过程中，遇到开始标签，执行start回调
 * 3.遇到结束标签，执行end回调
 * 4.遇到文本标签，执行chars回调
 * 5.遇到注释标签，执行comment回调
 * 注意：新插入栈的节点，其父节点就是栈中的最后节点
 */

parseHTML(template, {
    // 解析遇到开始标签
    // tag：标签名，attrs：属性数组，unary：是否是自闭合标签
    start(tag, attrs, unary) {

    },
    // 解析遇到结束标签
    end() {

    },
    // 解析遇到文本标签
    chars(text) {

    },
    // 解析遇到注释标签
    comment(text) {

    }
})

// parseHTML
export function parseHTML(html, options) {
    const stack = [] // 当前循环遍历的栈，用于构建节点的父子层级关系
    const expectHTML = options.expectHTML
    const isUnaryTag = options.isUnaryTag || no
    const canBeLeftOpenTag = options.canBeLeftOpenTag || no
    let index = 0
    let last, lastTag
    // 1.循环遍历html模板
    while (html) {
      last = html
      // Make sure we're not in a plaintext content element like script/style
      if (!lastTag || !isPlainTextElement(lastTag)) { // lastTag不存在，或者即使存在，也不是script,style,textarea标签
        // 获取<在html模板的位置
        let textEnd = html.indexOf('<')
        // <在html开头位置
        if (textEnd === 0) {
          // Comment:
          if (comment.test(html)) { // 当前html模板开头是一个注释文本
            // 获取注释文本的尾标记位置
            const commentEnd = html.indexOf('-->')
  
            if (commentEnd >= 0) {
              // 如果要保持注释
              if (options.shouldKeepComment) {
                options.comment(html.substring(4, commentEnd))
              }
              // 前进，将注释文本从html从移除，并将index移到相应位置
              advance(commentEnd + 3)
              continue
            }
          }
  
          // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
          // 也是注释
          if (conditionalComment.test(html)) {
            const conditionalEnd = html.indexOf(']>')
  
            if (conditionalEnd >= 0) {
              advance(conditionalEnd + 2)
              continue
            }
          }
  
          // Doctype:
          // html开头为头部申明
          const doctypeMatch = html.match(doctype)
          if (doctypeMatch) {
            advance(doctypeMatch[0].length)
            continue
          }
  
          // End tag:
          // html模板以结束标签开始
          const endTagMatch = html.match(endTag)
          if (endTagMatch) {
            const curIndex = index
            // 前进到结束标签的长度
            advance(endTagMatch[0].length)
            parseEndTag(endTagMatch[1], curIndex, index)
            continue
          }
  
          // Start tag:
          const startTagMatch = parseStartTag() // 返回组装好的开始标签的ast结构
          if (startTagMatch) {
            handleStartTag(startTagMatch)
            // 针对pre和textarea标签的
            if (shouldIgnoreFirstNewline(lastTag, html)) {
              advance(1)
            }
            continue
          }
        }
  
        let text, rest, next
        if (textEnd >= 0) {
          rest = html.slice(textEnd)
          while (
            !endTag.test(rest) &&
            !startTagOpen.test(rest) &&
            !comment.test(rest) &&
            !conditionalComment.test(rest)
          ) {
            // < in plain text, be forgiving and treat it as text
            // <以纯文本的形式显示
            next = rest.indexOf('<', 1)
            if (next < 0) break
            textEnd += next
            rest = html.slice(textEnd)
          }
          text = html.substring(0, textEnd)
          advance(textEnd)
        }
  
        // 找不到<符号，说明就是一段纯文本
        if (textEnd < 0) {
          text = html
          html = ''
        }
  
        // 执行创建文本节点ast的回调函数
        if (options.chars && text) {
          options.chars(text)
        }
      } else {
        // 处理script标签类型
        let endTagLength = 0
        const stackedTag = lastTag.toLowerCase()
        const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
        const rest = html.replace(reStackedTag, function (all, text, endTag) {
          endTagLength = endTag.length
          if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
            text = text
              .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
              .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
          }
          if (shouldIgnoreFirstNewline(stackedTag, text)) {
            text = text.slice(1)
          }
          if (options.chars) {
            options.chars(text)
          }
          return ''
        })
        index += html.length - rest.length
        html = rest
        parseEndTag(stackedTag, index - endTagLength, index)
      }
  
      if (html === last) {
        options.chars && options.chars(html)
        if (process.env.NODE_ENV !== 'production' && !stack.length && options.warn) {
          options.warn(`Mal-formatted tag at end of template: "${html}"`)
        }
        break
      }
    }
  
    // Clean up any remaining tags
    // 清空栈
    parseEndTag()
}

function advance (n) {
    index += n
    html = html.substring(n)
}

  // 编译开始标签
function parseStartTag () {
    const start = html.match(startTagOpen)
    // 如果html模板以开始标签开头
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
        start: index
      }
      // 前进一个开始标签的位置
      advance(start[0].length)
      // eg:从<div位置到>位置中间，查询是否存在attribute，有的话，组装一下
      let end, attr
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        match.attrs.push(attr)
      }
      // 前进一个>标签或者/>标签的位置，并返回组装的ast节点对象
      if (end) {
        match.unarySlash = end[1] // 推测：unarySlash为true代表不是自闭合标签
        advance(end[0].length)
        match.end = index
        return match
      }
    }
}

function handleStartTag (match) {
    // 开始标签名
    const tagName = match.tagName
    // 是否自闭合标签
    const unarySlash = match.unarySlash

    if (expectHTML) {
      // ？
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag)
      }
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag(tagName)
      }
    }

    // unary为true代表自闭合标签
    const unary = isUnaryTag(tagName) || !!unarySlash

    // 属性的个数
    const l = match.attrs.length
    const attrs = new Array(l)
    // 对属性的操作，暂时不管
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i]
      // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
      if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
        if (args[3] === '') { delete args[3] }
        if (args[4] === '') { delete args[4] }
        if (args[5] === '') { delete args[5] }
      }
      const value = args[3] || args[4] || args[5] || ''
      const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
        ? options.shouldDecodeNewlinesForHref
        : options.shouldDecodeNewlines
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      }
    }

    // 如果不是自闭合标签
    if (!unary) {
      // 将标签压入栈中
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs })
      lastTag = tagName
    }

    // 执行start回调
    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end)
    }
}

  // 这个函数主要负责判断结束标签对应的开始标签在栈中是否存在，做相应的处理，并回调end
function parseEndTag (tagName, start, end) {
    // start:前进之前的位置
    // end：前进之后的位置
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index

    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
    }

    // Find the closest opened tag of the same type
    // 如果有结束标签有标签名
    if (tagName) {
      // 找出当前结束标签对应的开始标签名在栈中的位置
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else { // 如果结束标签没有标签名，将栈中所有都弹出
      // If no tag name is provided, clean shop
      pos = 0
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      // 如果在栈中找到了与之对应的开始标签，循环从这个位置到栈尾，执行end回调，将其弹出栈
      for (let i = stack.length - 1; i >= pos; i--) {
        if (process.env.NODE_ENV !== 'production' &&
          (i > pos || !tagName) &&
          options.warn
        ) {
          options.warn(
            `tag <${stack[i].tag}> has no matching end tag.`
          )
        }
        if (options.end) {
          options.end(stack[i].tag, start, end)
        }
      }

      // Remove the open elements from the stack
      // 弹出栈
      stack.length = pos
      // lastTag更新为栈中最后一个标签
      lastTag = pos && stack[pos - 1].tag
    } else if (lowerCasedTagName === 'br') { // br标签
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') { // p标签？
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
}